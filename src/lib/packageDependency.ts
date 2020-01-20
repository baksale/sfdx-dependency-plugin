import { Connection } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import {EntityDependencyApi} from 'any-dependency-tree/dist/index';
import { Package2Version, SubscriberPackageVersion } from './model';

export class PackageDependencyApi implements EntityDependencyApi<Package2Version> {
    private packageToDependencyIds: Map<string, string[]> = new Map();
    private packages: Map<string, Package2Version> = new Map();
    private packageVersionQuery = 'select Id,SubscriberPackageVersionId,Package2.Name,Package2.NamespacePrefix'
        + ',Tag,Branch,MajorVersion,MinorVersion,PatchVersion,BuildNumber,IsReleased,IsPasswordProtected'
        + ' from Package2Version ';
    private packageVersionWhereClause = ' where SubscriberPackageVersionId in (%s) ';
    private packageVersionOrderByClause = ' order by Package2Id, MajorVersion,MinorVersion,PatchVersion,BuildNumber';
    private packageDependenciesQuery = ' select Dependencies from SubscriberPackageVersion ';
    private packageDependenciesWhereClause = ' where Id = \'%s\'';
    private packageVersionWhereClauseByVersion = ' where Package2Id=\'%i\' and MajorVersion=\'%m\' '
    + 'and MinorVersion=\'%n\' and PatchVersion=\'%p\' and BuildVersion=\'%b\'';

    private maxBuildVersionQuery = 'select max(buildnumber) latestbuildnumber from Package2Version where Package2Id=\'%i\' and MajorVersion=\'%m\' '
        + 'and MinorVersion=\'%n\' and PatchVersion=\'%p\'';

    constructor(private connection: Connection) {}

    public async getPackagesByIds(packageIds: string[]): Promise<Package2Version[]> {
        const result: Package2Version[] = [];
        if (packageIds.length === 0) return result;
        const missingPackageIds: string[] = [];
        packageIds.forEach(id => {
            if (!this.packages.has(id)) missingPackageIds.push('\'' + id + '\'');
            else result.push(this.packages.get(id));
        });
        if (missingPackageIds.length === 0) return result;
        const packageWhereClause = this.packageVersionWhereClause.replace('%s', missingPackageIds.join(','));
        const packagesQuery = this.packageVersionQuery + packageWhereClause + this.packageVersionOrderByClause;
        await this.connection.tooling.query<Package2Version>(packagesQuery)
            .then(packageQueryResult => {
                packageQueryResult.records.forEach(packageVersion => {
                    result.push(packageVersion);
                    this.packages.set(packageVersion.SubscriberPackageVersionId, packageVersion);
                });
            });
        return result;
    }

    public async getEntityDependencies(entity: Package2Version): Promise<Package2Version[]> {
        let result: Package2Version[] = [];
        if (entity.IsPasswordProtected) return result;
        else if (this.packageToDependencyIds.has(entity.SubscriberPackageVersionId)) {
            return await this.getPackagesByIds(this.packageToDependencyIds.get(entity.SubscriberPackageVersionId));
        }
        const packageDependencyIds: string[] = [];
        const dependenciesWhereClause = this.packageDependenciesWhereClause.replace('%s', entity.SubscriberPackageVersionId);
        const dependenciesQuery = this.packageDependenciesQuery + dependenciesWhereClause;
        await this.connection.tooling.query<SubscriberPackageVersion>(dependenciesQuery)
            .then(subscriberPackageVersion => {
                subscriberPackageVersion.records.forEach(packageVersion => {
                    if (packageVersion.Dependencies) {
                        packageVersion.Dependencies.ids.forEach(id => {
                            packageDependencyIds.push(id.subscriberPackageVersionId);
                        });
                    }
                });
            });
        this.packageToDependencyIds.set(entity.SubscriberPackageVersionId, packageDependencyIds);
        result = await this.getPackagesByIds(packageDependencyIds);
        return result;
    }
    public async getLatestPackageVersion(package2Id: string, majorVersion: string, minorVersion: string, patchVersion: string): Promise<Package2Version> {
        const internalMaxBuildVersionQuery = this.maxBuildVersionQuery
            .replace('%i', package2Id)
            .replace('%m', majorVersion)
            .replace('%n', minorVersion)
            .replace('%p', patchVersion);
        let maxBuildVersion: string = null;
        await this.connection.tooling.query<AnyJson>(internalMaxBuildVersionQuery)
            .then(maxBuildVersionQueryResult => {
                maxBuildVersionQueryResult.records.some(maxBuildVersionElement => {
                    maxBuildVersion = maxBuildVersionElement['latestbuildnumber'];
                });
            });
        const packageVersionQuery = (this.packageVersionQuery + this.packageVersionWhereClauseByVersion)
            .replace('%i', package2Id)
            .replace('%m', majorVersion)
            .replace('%n', minorVersion)
            .replace('%p', patchVersion)
            .replace('%b', maxBuildVersion);

        let result: Package2Version = null;
        await this.connection.tooling.query<Package2Version>(packageVersionQuery)
            .then(packageQueryResult => {
                packageQueryResult.records.forEach(packageVersion => {
                    result = packageVersion;
                });
            });
        return result;
    }
}
