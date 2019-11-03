import { Connection } from '@salesforce/core';
import {EntityDependencyApi} from 'any-dependency-tree/dist/index'
import { Package2Version, SubscriberPackageVersion } from './model';

export class PackageDependencyApi implements EntityDependencyApi<Package2Version>{
    private packageVersionQuery = 'select Id,Package2Id,SubscriberPackageVersionId,Name,Package2'
        +',Description,Tag,Branch,MajorVersion,MinorVersion,PatchVersion,BuildNumber,IsRelease,CreatedDate'
        +',LasteModifiedDate,IsPasswordProtected from Package2Version ';
    private packageVersionWhereClause = ' where SubscriberPackageVersionId in (%s) ';
    private packageVersionOrderByClause = ' order by Package2Id, MajorVersion,MinorVersion,PatchVersion,BuildNumber';
    private packageDependenciesQuery = ' select Dependencise from SubscriberPackageVersion ';
    private packageDependenciesWhereClause = ' where SubscriberPackageVersionId = \'%s\'';

    constructor(private connection: Connection){};
    public getPackagesByIds(packageIds: string[]): Package2Version[]{
        const result: Package2Version[] = [];
        const packageWhereClause = this.packageVersionWhereClause.replace('%s)', packageIds.join(','));
        const packagesQuery = this.packageVersionQuery; + packageWhereClause + this.packageVersionOrderByClause;
        this.connection.tooling.query<Package2Version>(packagesQuery)
            .then(packageQueryResult => {
                packageQueryResult.records.forEach(packageVersion => {
                    result.push(packageVersion);
                })
            });        
        return result;
    }
    
    public getEntityDependencies(entity: Package2Version): Package2Version[] {
        const result: Package2Version[] = [];
        if(entity.IsPasswordProtected) return result;
        const packageDependencyIds: string[] = [];
        const dependenciesWhereClause = this.packageDependenciesWhereClause.replace('%s', entity.subscriberPackageVersionId);
        const dependenciesQuery = this.packageDependenciesQuery + dependenciesWhereClause;
        this.connection.tooling.query<SubscriberPackageVersion>(dependenciesQuery)
            .then(subscriberPackageVersion => {
                subscriberPackageVersion.records.forEach(packageVersion => {
                    packageVersion.Dependencies.ids.forEach(id =>{
                        packageDependencyIds.push('\'' + id.subscriberPackageVersionId + '\'');
                    })
                });
            });
        return this.getPackagesByIds(packageDependencyIds);
    }
    
}