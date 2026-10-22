/**
 * Hosting limits and resource constraints for a hosting account
 */
export interface LimitsProperties {
  /** Domains */
  max_site: number;

  /** Subdomains */
  max_subdom: number;

  /** Domain aliases */
  max_dom_aliases: number;

  /** Disk space */
  disk_space: number;

  /** Notify when disk space usage reaches */
  disk_space_soft: number;

  /** Traffic */
  max_traffic: number;

  /** Notify when traffic usage reaches */
  max_traffic_soft: number;

  /** Web users */
  max_wu: number;

  /** Additional FTP accounts */
  max_subftp_users: number;

  /** Databases */
  max_db: number;

  /** Mailboxes */
  max_box: number;

  /** Mailbox size */
  mbox_quota: number;

  /** Mailing lists */
  max_maillists: number;

  /** Expiration date */
  expiration: Date;

  /** Notify when the expiration date reaches */
  expiration_soft: Date;

  /** Maximum CPU usage */
  cgroups_cpu_usage: number;

  /** Notify when CPU usage reaches this value */
  cgroups_cpu_usage_soft: number;

  /** Maximum RAM usage */
  cgroups_ram_usage: number;

  /** Notify when RAM usage reaches this value */
  cgroups_ram_usage_soft: number;

  /** Maximum Disk Read usage */
  cgroups_disk_read_usage: number;

  /** Notify when Disk Read usage reaches this value */
  cgroups_disk_read_usage_soft: number;

  /** Maximum Disk Write usage */
  cgroups_disk_write_usage: number;

  /** Notify when Disk Write usage reaches this value */
  cgroups_disk_write_usage_soft: number;

  /** Period to check CPU usage */
  cgroups_cpu_period: number;

  /** Period to check RAM usage */
  cgroups_ram_period: number;

  /** Period to check Disk Read speed usage */
  cgroups_disk_read_period: number;

  /** Period to check Disk Write speed usage */
  cgroups_disk_write_period: number;

  /** WordPress Websites */
  ext_limit_wp_toolkit_wp_instances: number;

  /** WordPress Backups */
  ext_limit_wp_toolkit_wp_backups: number;

  /** WordPress websites with Smart Update */
  ext_limit_wp_toolkit_smart_update_instances: number;

  /** WordPress websites with vulnerability protection */
  ext_limit_wp_toolkit_virtual_patches_instances: number;

  /** Rank Tracker crawls */
  ext_limit_xovi_max_keywords: number;

  /** Speed Kit domains */
  ext_limit_baqend_domains: number;
}
