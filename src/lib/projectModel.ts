/**
 * A product in the catalog
 */
export interface SfdxProjectModel {
  /**
   * The global namespace that is used with a package. The namespace must be registered with
   * an org that is associated with your Dev Hub org. This namespace is assigned to scratch
   * orgs created with the org:create command. If you’re creating an unlocked package, you
   * have the option to create a package with no namespace.
   */
  namespace?: string;
  /**
   * By default, the OAuth port is 1717. However, change this port if this port is already in
   * use, and you plan to create a connected app in your Dev Hub org to support JWT-based
   * authorization.
   */
  oauthLocalPort?: number;
  /**
   * The Salesforce CLI updates this file with the aliases when you create a package or
   * package version. You can also manually update this section for existing packages or
   * package versions. You can use the alias instead of the cryptic package ID when running
   * CLI force:package commands.
   */
  packageAliases?: { [key: string]: string };
  /**
   * Package directories indicate which directories to target when syncing source to and from
   * the scratch org. These directories can contain source from your managed package,
   * unmanaged package, or unpackaged source, for example, ant tool or change set.
   */
  packageDirectories: PackageDirectory[];
  /**
   * Salesforce CLI plugins and configuration used with this project.
   */
  plugins?: { [key: string]: string };
  /**
   * The login URL that the force:auth commands use. If not specified, the default is
   * login.salesforce.com. Override the default value if you want users to authorize to a
   * specific Salesforce instance. For example, if you want to authorize into a sandbox org,
   * set this parameter to test.salesforce.com.
   */
  sfdcLoginUrl?: string;
  /**
   * The url that is used when creating new scratch orgs. This is typically only used for
   * testing prerelease environments.
   */
  signupTargetLoginUrl?: string;
  /**
   * The API version that the source is compatible with. The default is the same version as
   * the Salesforce CLI.
   */
  sourceApiVersion?: string;
}

export interface PackageDirectory {
  ancestorId?: string;
  ancestorVersion?: string;
  default?: boolean;
  definitionFile?: string;
  dependencies?: PackageDirectoryDependency[];
  package?: string;
  path: string;
  versionDescription?: string;
  versionName?: string;
  versionNumber?: string;
}

export interface PackageDirectoryDependency {
  package: string;
  versionNumber?: string;
}
