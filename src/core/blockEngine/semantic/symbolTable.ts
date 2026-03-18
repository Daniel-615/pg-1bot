export type VarType="number" |"boolean" | "string" | null;

export interface SymbolInfo{
    name: string;
    type: VarType;
    value: any;
    initialized: boolean;
    used: boolean;
    scopeLevel: number;
}
export interface ExecutionSnapshot{
    step: number;
    scopes: Map<string, SymbolInfo>[];
}
export interface SymbolTableRow{
    name: string;
    type: VarType;
    value: any;
    initialized: boolean;
    used: boolean;
    scopeLevel: number;
}
export class SymbolTable{
    private globalScope: Map <string, SymbolInfo>= new Map();
    private scopeStack: Map <string, SymbolInfo>[]= [];
    private snapshots: ExecutionSnapshot[]= [];
    private stepCounter= 0;
    constructor(){
        this.scopeStack.push(this.globalScope);
    }
    
    reset(){
        this.globalScope = new Map();
        this.scopeStack = [this.globalScope];
        this.snapshots = [];
        this.stepCounter = 0;
    }
    public cloneState() {
        /*Makes a copy of the symbol table state */
        return this.scopeStack.map(scope => new Map(scope));
    }
    enterScope(){
        const newScope= new Map<string,SymbolInfo>();
        this.scopeStack.push(newScope);
    }
    exitScope(){
        if(this.scopeStack.length>1){
            this.scopeStack.pop();
        }
    }
    private currentScope(){
        return this.scopeStack[this.scopeStack.length-1];
    }
    declare(name :string, type: VarType): boolean{
        const scope=this.currentScope();
        if(scope.has(name)){
            return false; //si ya existe retorna falso
        }
        scope.set(name,{
            name,
            type,
            value: null,
            initialized: false,
            used: false,
            scopeLevel: this.scopeStack.length-1
        });
        this.saveSnapshot();
        return true;
    }

    assign(name: string, value: any, type:VarType): boolean{
        const symbol=this.lookup(name);
        if(!symbol) return false;

        symbol.value=value;
        symbol.type=type;
        symbol.initialized=true;

        this.saveSnapshot();
        return true;
    }

    use(name: string): SymbolInfo | null{
        const symbol= this.lookup(name);
        if(symbol){
            symbol.used=true;
            this.saveSnapshot(); 
        }
        return symbol;
    }

    lookup(name: string): SymbolInfo | null{
        for (let i= this.scopeStack.length-1; i>=0; i--){
            const scope= this.scopeStack[i];
            if(scope.has(name)){
                return scope.get(name)!;
            }
        }
        return null;
    }
    private saveSnapshot() {

        const copyScopes = this.scopeStack.map(scope => {
        return new Map(
            Array.from(scope.entries()).map(([key, value]) => [
            key,
            { ...value }
            ])
        );
        });

        this.snapshots.push({
        step: this.stepCounter++,
        scopes: copyScopes
        });
    }
    getSnapshots(): ExecutionSnapshot[]{
        return this.snapshots;
    }
    getFinalState(): Map <string, SymbolInfo>[]{
        return this.scopeStack;
    }
    getRows(): SymbolTableRow[] {
        return this.scopeStack.flatMap(scope =>
            Array.from(scope.values()).map(symbol => ({
                name: symbol.name,
                type: symbol.type,
                value: symbol.value,
                initialized: symbol.initialized,
                used: symbol.used,
                scopeLevel: symbol.scopeLevel
            }))
        );
    }
     toFlatObject() {
    const result: any = {};

    this.scopeStack.forEach(scope => {
      scope.forEach((symbol, name) => {
        result[name] = {
          type: symbol.type,
          value: symbol.value,
          initialized: symbol.initialized,
          used: symbol.used,
          scopeLevel: symbol.scopeLevel
        };
      });
    });

    return result;
  }
}
