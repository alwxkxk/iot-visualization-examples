// @ts-ignore
const db =window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
if (!db) {
  window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}

const Name = "glb_cache_db";
const StoreName = "glb_cache";

class IndexedDB {
  db:IDBDatabase;
  constructor() {
  }

  init():Promise<IndexedDB>{
    const scope = this;
    return new Promise((resolve,reject)=>{
      const request = indexedDB.open(Name);
      request.onerror=(event)=>{
        reject("Database init error");
      }
  
      request.onupgradeneeded=()=>{
        const db = scope.db = request.result;
        if(!db.objectStoreNames.contains(StoreName)){
          db.createObjectStore(StoreName, { keyPath: 'id' })
        }
      }
  
      request.onsuccess=()=>{
        scope.db = request.result;
        resolve(scope)
      } 
    });
  }

  getCache(key:string):Promise<any>{
    const scope = this;
    const beginTime = performance.now();
    return new Promise((resolve,reject)=>{
      const transaction = scope.db.transaction([StoreName],"readonly");
      const objectStore = transaction.objectStore(StoreName);
      const request=objectStore.get(key);

      transaction.onerror=(event)=>{
        reject("indexedDB transaction error");
      }
      request.onerror=(event)=>{
        reject("indexedDB objectStore request error");
      }
      request.onsuccess=()=>{
        resolve(request.result);
        const time =  performance.now();
        console.log("get cache thme:",time - beginTime);
      }
    });
  }

  setCache(key:string,data:any){
    const transaction = this.db.transaction([StoreName],"readwrite");
    const objectStore = transaction.objectStore(StoreName);
    const request=objectStore.put({id:key,data:data});
    const beginTime = performance.now();
    transaction.onerror=(event)=>{
      console.error("indexedDB transaction error");
    }
    request.onerror=(event)=>{
      console.error("indexedDB objectStore request error");
    }
    request.onsuccess=()=>{
      const time =  performance.now();
      console.log("set cache thme:",time - beginTime);
    }
  }

}

export default IndexedDB;
