import IndexedDB from "./common/IndexedDB";

const db = new IndexedDB();

// @ts-ignore
window.debugDB = db;