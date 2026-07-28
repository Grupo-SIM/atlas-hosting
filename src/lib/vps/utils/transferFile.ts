interface TransferFileArgs {
  file: string;
  remote: string;
  remotePath: string;
  sshpass: string | string[];
}

export const transferFile = async ({
  file,
  remote,
  remotePath,
  sshpass,
}: TransferFileArgs) => {
  if (remotePath.search(/\./) === -1) {
    throw new Error("Remote path must contain a file name.");
  }

  const localPath = `/tmp/${Bun.randomUUIDv7()}`;
  const remoteFolder = remotePath.split("/").slice(0, -1).join("/");

  await Promise.all([
    Bun.$`${sshpass} ssh ${remote} 'mkdir -p ${remoteFolder}'`.quiet(),
    Bun.write(localPath, file),
  ]);

  await Bun.$`${sshpass} scp ${localPath} ${remote}:${remotePath}`.quiet();

  await Bun.$`rm ${localPath}`.quiet();
};
