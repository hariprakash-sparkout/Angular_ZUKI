import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  /**
 * Store data in localstorage
 * @param {string} key
 * @param {any} value
 */
  setItem(key:any, value:any) {
    localStorage.setItem(key, value);
  }

  /**
   * Get data from localstorage
   * @param {string} key
   * @return {string} value of the key from local storage
   */
  getItem(key:any) {
    return localStorage.getItem(key);
  }

  /**
   * Remove data from localstorage
   * @param {string} key
   * @return {string} value
   */
  removeItem(key:any) {
    return localStorage.removeItem(key);
  }

  /**
   * clear data from localstorage
   */
  clearItem() {
    localStorage.clear();
  }
}
