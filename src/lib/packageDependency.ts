import { Connection } from '@salesforce/core';
import {EntityDependencyApi} from 'any-dependency-tree/dist/index'
import { Package2Version, SubscriberPackageVersion } from './model';

export class PackageDependencyApi implements EntityDependencyApi<Package2Version>{
    private packageVersionQuery = 'select Id,SubscriberPackageVersionId,Package2.Name,Package2.NamespacePrefix'
        +',Tag,Branch,MajorVersion,MinorVersion,PatchVersion,BuildNumber,IsReleased,IsPasswordProtected'
        +' from Package2Version ';
    private packageVersionWhereClause = ' where SubscriberPackageVersionId in (%s) ';
    private packageVersionOrderByClause = ' order by Package2Id, MajorVersion,MinorVersion,PatchVersion,BuildNumber';
    private packageDependenciesQuery = ' select Dependencies from SubscriberPackageVersion ';
    private packageDependenciesWhereClause = ' where Id = \'%s\'';

    constructor(private connection: Connection){};

    public async getPackagesByIds(packageIds: string[]): Promise<Package2Version[]>{
        const result: Package2Version[] = [];
        if(packageIds.length == 0) return result;
        const packageWhereClause = this.packageVersionWhereClause.replace('%s', packageIds.join(','));
        const packagesQuery = this.packageVersionQuery + packageWhereClause + this.packageVersionOrderByClause;
        await this.connection.tooling.query<Package2Version>(packagesQuery)
            .then(packageQueryResult => {
                packageQueryResult.records.forEach(packageVersion => {
                    result.push(packageVersion);
                })
            });        
        return result;
    }
    
    public async getEntityDependencies(entity: Package2Version): Promise<Package2Version[]> {
        const result: Package2Version[] = [];
        if(entity.IsPasswordProtected) return result;
        const packageDependencyIds: string[] = [];
        const dependenciesWhereClause = this.packageDependenciesWhereClause.replace('%s', entity.SubscriberPackageVersionId);
        const dependenciesQuery = this.packageDependenciesQuery + dependenciesWhereClause;
        await this.connection.tooling.query<SubscriberPackageVersion>(dependenciesQuery)
            .then(subscriberPackageVersion => {
                subscriberPackageVersion.records.forEach(packageVersion => {
                    packageVersion.Dependencies&&packageVersion.Dependencies.ids.forEach(id =>{
                        packageDependencyIds.push('\'' + id.subscriberPackageVersionId + '\'');
                    })
                });
            });
        return await this.getPackagesByIds(packageDependencyIds);
    }
    
}