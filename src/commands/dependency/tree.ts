import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { DependencyTreeBuilder } from 'any-dependency-tree/dist';
import { DependencyTreeNode } from 'any-dependency-tree/dist/dependencyTreeNode';
import { Serializing } from 'any-dependency-tree/dist/visitor/serializing';
import { DxPackageFilter } from '../../lib/dxPackageFilter';
import { DxPackageSerializer } from '../../lib/dxPackageSerializer';
import { Package2Version } from '../../lib/model';
import { PackageDependencyApi } from '../../lib/packageDependency';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-dependency-plugin', 'org');

export default class Tree extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `$ sfdx dependency:tree --targetdevhubusername devhub@org.com --package '04t0..'
  Main Package:0
  +- 1st Level Pacakge 1:A
  |  +- 2nd Level Package 1:C
  |  +- 2nd Level Package 2:D
  |  |  \\- 3rd Level Package only:F
  |  \\- 2nd Level Package last:E
  \\- 1st Level Pacakge 2:B
  `,
  `$ sfdx dependency:tree -p '04tA..'
  1st Level Pacakge 1:A
  +- 2nd Level Package 1:C
  +- 2nd Level Package 2:D
  |  \\- 3rd Level Package only:F
  \\- 2nd Level Package last:E
  `
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-p, --package=VALUE)
    package: flags.string({char: 'p', description: messages.getMessage('packageFlagDescription')}),
    filter: flags.string({char: 'f', description: messages.getMessage('filterFlagDescription')}),
    withversion: flags.boolean({description: messages.getMessage('packageVersionDescription'), default: false}),
    version: flags.boolean({description: messages.getMessage('packageVersionDescription'), default: false}), // , deprecated: {to: 'withversion', message: '', version: '1.2'}
    withid: flags.boolean({description: messages.getMessage('idFlagDescription'), default: false}),
    id: flags.boolean({description: messages.getMessage('idFlagDescription'), default: false}) // , deprecated: {to: 'withid', message: '', version: '1.2'}
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = false;

  // Comment this out if your command does not support a hub org username
  protected static requiresDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    let packageId: string = this.flags.package;
    let packageFilter: string = this.flags.filter;
    if (packageId == null) { return {errorMessage: messages.getMessage('errorNoPackageProvided')}; }
    packageId = packageId.replace('\'', '').replace('\'', '');
    packageFilter = packageFilter.replace('\'', '').replace('\'', '');
    const dependencyApi = new PackageDependencyApi(this.hubOrg.getConnection());
    const dependencyBuilder = new DependencyTreeBuilder<Package2Version>(dependencyApi);
    const dxPackages: Package2Version[] = await dependencyApi.getPackagesByIds([packageId]);
    const dxPackage: Package2Version = dxPackages[0];
    const rootNode: DependencyTreeNode<Package2Version> = await dependencyBuilder.buildDependencyTree(dxPackage);
    const serializer = new DxPackageSerializer(this.flags.version || this.flags.withversion, this.flags.id || this.flags.withid);
    const visitor: Serializing = new Serializing(serializer, false, new DxPackageFilter(packageFilter));
    this.ux.log(visitor.visitTree(rootNode));
    // Return an object to be displayed with --json
    return new Serializing(serializer, true).visitTree(rootNode);
  }
}
