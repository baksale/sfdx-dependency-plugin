import { Connection } from '@salesforce/core';
import {EntityDependencyApi} from 'any-dependency-tree/dist/index'
import { Package2Version, SubscriberPackageVersion, Dependencies } from './model';

export class PackageDependencyApi implements EntityDependencyApi<Package2Version>{
    private packageToDependencyIds: Map<string, string[]> = new Map();
    private packages: Map<string, Package2Version> = new Map();
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
        const missingPackageIds: string[] = [];
        packageIds.forEach(id =>{
            if(!this.packages.has(id)) missingPackageIds.push(id);
            else result.push(this.packages.get(id));
        });
        const packageWhereClause = this.packageVersionWhereClause.replace('%s', missingPackageIds.join(','));
        const packagesQuery = this.packageVersionQuery + packageWhereClause + this.packageVersionOrderByClause;
        await this.connection.tooling.query<Package2Version>(packagesQuery)
            .then(packageQueryResult => {
                packageQueryResult.records.forEach(packageVersion => {
                    result.push(packageVersion);
                    this.packages.set('\'' + packageVersion.SubscriberPackageVersionId + '\'', packageVersion);
                })
            });
        return result;
    }
    
    public async getEntityDependencies(entity: Package2Version): Promise<Package2Version[]> {
        let result: Package2Version[] = [];
        if(entity.IsPasswordProtected) return result;
        else if(this.packageToDependencyIds.has(entity.SubscriberPackageVersionId)){
            return await this.getPackagesByIds(this.packageToDependencyIds.get(entity.SubscriberPackageVersionId));
        }
        const packageDependencyIds: string[] = [];
        const dependenciesWhereClause = this.packageDependenciesWhereClause.replace('%s', entity.SubscriberPackageVersionId);
        const dependenciesQuery = this.packageDependenciesQuery + dependenciesWhereClause;
        await this.connection.tooling.query<SubscriberPackageVersion>(dependenciesQuery)
            .then(subscriberPackageVersion => {
                subscriberPackageVersion.records.forEach(packageVersion => {
                    if(packageVersion.Dependencies){
                        packageVersion.Dependencies&&packageVersion.Dependencies.ids.forEach(id =>{
                            packageDependencyIds.push('\'' + id.subscriberPackageVersionId + '\'');
                        })
                        this.packageToDependencyIds.set(entity.SubscriberPackageVersionId, packageDependencyIds);
                    }
                });
            });
        result = await this.getPackagesByIds(packageDependencyIds);
        return result;
    }
    
}