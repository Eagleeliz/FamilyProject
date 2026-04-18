import { Relationship, Person, CousinResult } from '../types/index.js';
interface CreateRelationshipInput {
    personId: string;
    relatedPersonId: string;
    relationshipType: 'parent' | 'child' | 'sibling' | 'spouse';
}
export declare class RelationshipService {
    create(input: CreateRelationshipInput, userId: string): Promise<Relationship[]>;
    delete(id: string, userId: string): Promise<void>;
    getRelatives(personId: string, userId: string): Promise<{
        parents: Person[];
        children: Person[];
        siblings: Person[];
        spouses: Person[];
    }>;
    getCousins(personId: string, userId: string, maxDegree?: number): Promise<CousinResult[]>;
    private findCousinsOfDegree;
    private getRelatedPersons;
    private getPerson;
    private mapRelationship;
}
export declare const relationshipService: RelationshipService;
export {};
//# sourceMappingURL=relationship.service.d.ts.map