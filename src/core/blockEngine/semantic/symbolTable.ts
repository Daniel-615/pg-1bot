export type VarType="number" |"boolean" | "string" | "array" | null;
export type ScopeKind = "global" | "local";

export interface SymbolInfo{
    name: string;
    type: VarType;
    value: any;
    initialized: boolean;
    used: boolean;
    scopeLevel: number;
    scopeId: number;
    scopeKind: ScopeKind;
    declaredByBlockId?: string;
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
    scopeId: number;
    scopeKind: ScopeKind;
    active: boolean;
}

interface ScopeFrame {
    id: number;
    kind: ScopeKind;
    symbols: Map<string, SymbolInfo>;
}

export class SymbolTable{
    private globalScope: ScopeFrame = {
        id: 0,
        kind: "global",
        symbols: new Map(),
    };
    private scopeStack: ScopeFrame[]= [];
    private snapshots: ExecutionSnapshot[]= [];
    private stepCounter= 0;
    private scopeCounter = 1;
    private allSymbols: SymbolInfo[] = [];

    constructor(){
        this.scopeStack.push(this.globalScope);
    }
    
    reset(){
        this.globalScope = {
            id: 0,
            kind: "global",
            symbols: new Map(),
        };
        this.scopeStack = [this.globalScope];
        this.snapshots = [];
        this.stepCounter = 0;
        this.scopeCounter = 1;
        this.allSymbols = [];
    }
    public cloneState() {
        /*Makes a copy of the symbol table state */
        return this.scopeStack.map(scope => new Map(scope.symbols));
    }
    enterScope(){
        const newScope: ScopeFrame = {
            id: this.scopeCounter++,
            kind: "local",
            symbols: new Map<string, SymbolInfo>(),
        };
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
    declare(name :string, type: VarType, declaredByBlockId?: string): boolean{
        const scope=this.currentScope();
        if(scope.symbols.has(name)){
            return false; //si ya existe retorna falso
        }
        const symbolInfo: SymbolInfo = {
            name,
            type,
            value: null,
            initialized: false,
            used: false,
            scopeLevel: this.scopeStack.length-1,
            scopeId: scope.id,
            scopeKind: scope.kind,
            declaredByBlockId,
        };
        scope.symbols.set(name, symbolInfo);
        this.allSymbols.push(symbolInfo);
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
            if(scope.symbols.has(name)){
                return scope.symbols.get(name)!;
            }
        }
        return null;
    }
    private saveSnapshot() {

        const copyScopes = this.scopeStack.map(scope => {
        return new Map(
            Array.from(scope.symbols.entries()).map(([key, value]) => [
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
        return this.scopeStack.map(scope => scope.symbols);
    }
    getRows(): SymbolTableRow[] {
        return this.allSymbols
            .map(symbol => ({
                name: symbol.name,
                type: symbol.type,
                value: symbol.value,
                initialized: symbol.initialized,
                used: symbol.used,
                scopeLevel: symbol.scopeLevel,
                scopeId: symbol.scopeId,
                scopeKind: symbol.scopeKind,
                active: this.scopeStack.some(scope => scope.id === symbol.scopeId),
            }))
            .sort((left, right) => {
                if (left.scopeLevel !== right.scopeLevel) {
                    return left.scopeLevel - right.scopeLevel;
                }

                if (left.scopeId !== right.scopeId) {
                    return left.scopeId - right.scopeId;
                }

                return left.name.localeCompare(right.name);
            });
    }
    getTrackedSymbols(): SymbolInfo[] {
        return this.allSymbols.map(symbol => ({ ...symbol }));
    }
     toFlatObject() {
    const result: any = {};

    this.scopeStack.forEach(scope => {
      scope.symbols.forEach((symbol, name) => {
        result[name] = {
          type: symbol.type,
          value: symbol.value,
          initialized: symbol.initialized,
          used: symbol.used,
          scopeLevel: symbol.scopeLevel,
          scopeId: symbol.scopeId,
          scopeKind: symbol.scopeKind,
        };
      });
    });

    return result;
  }
}
