import psutil
import socket
import docker
import os
import time
import asyncio
import aiohttp
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

# --- CONFIGURAÇÕES ---
ATLAS_TOKEN = "{{ATLAS_TOKEN}}"
ATLAS_API_URL = "https://atlashosting.com.br/api/vps/telemetry"

ATLAS_INTERVAL = 60
VM_NAME = socket.gethostname()

executor = ThreadPoolExecutor(max_workers=20)

try:
    docker_client = docker.from_env()
except:
    docker_client = None


def format_bytes(n):
    for unit in ["", "K", "M", "G", "T"]:
        if n < 1024:
            return f"{n:.2f}{unit}B"
        n /= 1024
    return f"{n:.2f}PB"


def get_single_container_stats(container):
    try:
        st = container.stats(stream=False)
        cpu_d = (
            st["cpu_stats"]["cpu_usage"]["total_usage"]
            - st["precpu_stats"]["cpu_usage"]["total_usage"]
        )
        sys_d = (
            st["cpu_stats"]["system_cpu_usage"] - st["precpu_stats"]["system_cpu_usage"]
        )
        cpu_usage = (cpu_d / sys_d) * 100.0 if sys_d > 0 else 0.0
        return {
            "name": container.name,
            "cpu": cpu_usage,
            "mem": format_bytes(st["memory_stats"]["usage"]),
        }
    except:
        return None


# --- COLETA DE MÉTRICAS (VERSÃO V7 MÉTODO ROBUSTO) ---
def get_system_metrics(detailed=False):
    all_procs = []
    for p in psutil.process_iter(["pid", "name", "memory_info"]):
        try:
            p.cpu_percent()
            all_procs.append(p)
        except:
            continue

    cpu_cores = psutil.cpu_percent(interval=1.0, percpu=True)
    avg_cpu = sum(cpu_cores) / len(cpu_cores) if cpu_cores else 0

    vmem = psutil.virtual_memory()
    load1, load5, load15 = os.getloadavg() if hasattr(os, "getloadavg") else (0, 0, 0)
    uptime_sec = time.time() - psutil.boot_time()
    uptime_str = f"{int(uptime_sec // 86400)}d {int((uptime_sec % 86400) // 3600)}h"

    proc_list = []
    for p in all_procs:
        try:
            info = p.info
            cpu = p.cpu_percent()
            mem = format_bytes(info["memory_info"].rss) if info["memory_info"] else "0B"
            if cpu > 0.1 or info["pid"] == 1:
                proc_list.append(
                    {
                        "pid": info["pid"],
                        "name": info["name"].upper(),
                        "cpu": cpu,
                        "mem_abs": mem,
                    }
                )
        except:
            continue

    disks = []
    for part in psutil.disk_partitions():
        if any(x in part.device for x in ["loop", "snap", "tmpfs"]):
            continue
        try:
            usage = psutil.disk_usage(part.mountpoint)
            disks.append(
                {
                    "mount": part.mountpoint,
                    "total": format_bytes(usage.total),
                    "used": format_bytes(usage.used),
                    "percent": usage.percent,
                }
            )
        except:
            continue

    container_info = []
    if docker_client and detailed:
        try:
            containers = docker_client.containers.list()
            futures = [
                executor.submit(get_single_container_stats, c) for c in containers
            ]
            for future in as_completed(futures, timeout=10):
                res = future.result()
                if res:
                    container_info.append(res)
        except:
            pass

    return {
        "cpu": avg_cpu,
        "cpu_cores": cpu_cores,
        "load_avg": [load1, load5, load15],
        "ram": {
            "total": format_bytes(vmem.total),
            "used": format_bytes(vmem.used),
            "available": format_bytes(vmem.available),
            "cached": format_bytes(getattr(vmem, "cached", 0)),
            "free": format_bytes(vmem.free),
            "percent": vmem.percent,
        },
        "disks": disks,
        "uptime": uptime_str,
        "pids": len(psutil.pids()),
        "containers": container_info,
        "processes": sorted(proc_list, key=lambda x: x["cpu"], reverse=True)[:31],
    }


# --- SINCRONIZAÇÃO COMPARTILHADA ---
async def sync_with_atlas():
    try:
        m = await asyncio.get_event_loop().run_in_executor(
            executor, get_system_metrics, False
        )
        payload = {
            "token": ATLAS_TOKEN,
            "cpu_usage": m["cpu"],
            "ram_usage": m["ram"]["percent"],
            "disk_usage": m["disks"][0]["percent"] if m["disks"] else 0,
            "uptime": m["uptime"],
            "process_count": m["pids"],
            "processes": m["processes"],
            "metadata": {
                "cpu_cores": m["cpu_cores"],
                "load_avg": m["load_avg"],
                "ram_details": m["ram"],
                "disks_details": m["disks"],
            },
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(ATLAS_API_URL, json=payload, timeout=15) as resp:
                print(
                    f"[{datetime.now().strftime('%H:%M:%S')}] 📡 Atlas Sync: {resp.status}"
                )
    except Exception as e:
        print(f"❌ Erro Atlas: {e}")


async def atlas_task():
    while True:
        await sync_with_atlas()
        await asyncio.sleep(ATLAS_INTERVAL)


# --- LOOP DE ESCUTA DO BOTÃO (PULSE - 3 SEGUNDOS) ---
async def command_pulse_task():
    while True:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{ATLAS_API_URL}?token={ATLAS_TOKEN}", timeout=5
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        if data.get("refresh"):
                            print("⚡ COMANDO DE ATUALIZAÇÃO FORÇADA RECEBIDO!")
                            await sync_with_atlas()
        except:
            pass
        await asyncio.sleep(3)


async def main():
    print(f"🚀 Sentinela V7 (Ultra Pulse) Ativo")
    asyncio.create_task(atlas_task())
    asyncio.create_task(command_pulse_task())
    while True:
        await asyncio.sleep(3600)


asyncio.run(main())
