import { Serializer } from "any-dependency-tree/dist/serializer";
import { Package2Version } from "./model";

export class DxPackageSerializer implements Serializer<Package2Version>{
    serialize(element: Package2Version): string {
        return element.Package2.Name + ':' 
            + element.MajorVersion + '.' 
            + element.MinorVersion + '.'
            + element.PatchVersion + '.'
            + element.BuildNumber;
    }
    
}