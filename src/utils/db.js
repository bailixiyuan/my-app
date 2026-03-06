// IndexedDB 工具类
class WardrobeDB {
  constructor() {
    this.dbName = 'wardrobeDB';
    this.dbVersion = 2;
    this.db = null;
  }

  // 初始化数据库
  initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('clothes')) {
          db.createObjectStore('clothes', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
        if (!db.objectStoreNames.contains('collections')) {
          db.createObjectStore('collections', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject('数据库打开失败');
      };
    });
  }

  // 添加衣物
  addClothing(clothing) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initDB()
          .then(() => this.addClothing(clothing))
          .then(resolve)
          .catch(reject);
        return;
      }

      const transaction = this.db.transaction(['clothes'], 'readwrite');
      const store = transaction.objectStore('clothes');
      const request = store.add(clothing);

      request.onsuccess = () => {
        resolve('添加成功');
      };

      request.onerror = () => {
        reject('添加失败');
      };
    });
  }

  // 获取所有衣物
  getAllClothing() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initDB()
          .then(() => this.getAllClothing())
          .then(resolve)
          .catch(reject);
        return;
      }

      const transaction = this.db.transaction(['clothes'], 'readonly');
      const store = transaction.objectStore('clothes');
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = () => {
        reject('获取失败');
      };
    });
  }

  // 分页获取衣物
  getClothingByPage(page, pageSize) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initDB()
          .then(() => this.getClothingByPage(page, pageSize))
          .then(resolve)
          .catch(reject);
        return;
      }

      const transaction = this.db.transaction(['clothes'], 'readonly');
      const store = transaction.objectStore('clothes');
      const request = store.getAll();

      request.onsuccess = (event) => {
        const allClothes = event.target.result;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedClothes = allClothes.slice(startIndex, endIndex);
        resolve({
          clothes: paginatedClothes,
          hasMore: endIndex < allClothes.length,
        });
      };

      request.onerror = () => {
        reject('获取失败');
      };
    });
  }

  // 根据分类获取衣物
  getClothingByType(type) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initDB()
          .then(() => this.getClothingByType(type))
          .then(resolve)
          .catch(reject);
        return;
      }

      this.getAllClothing()
        .then((clothes) => {
          const filtered = clothes.filter((item) => item.type === type);
          resolve(filtered);
        })
        .catch(reject);
    });
  }

  // 根据标签获取衣物
  getClothingByTag(tag) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initDB()
          .then(() => this.getClothingByTag(tag))
          .then(resolve)
          .catch(reject);
        return;
      }

      this.getAllClothing()
        .then((clothes) => {
          const filtered = clothes.filter(
            (item) => item.tags && item.tags.includes(tag)
          );
          resolve(filtered);
        })
        .catch(reject);
    });
  }

  // 更新衣物
  updateClothing(id, updatedData) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initDB()
          .then(() => this.updateClothing(id, updatedData))
          .then(resolve)
          .catch(reject);
        return;
      }

      const transaction = this.db.transaction(['clothes'], 'readwrite');
      const store = transaction.objectStore('clothes');
      const request = store.get(id);

      request.onsuccess = (event) => {
        const clothing = event.target.result;
        if (clothing) {
          const updatedClothing = { ...clothing, ...updatedData };
          const updateRequest = store.put(updatedClothing);
          updateRequest.onsuccess = () => resolve('更新成功');
          updateRequest.onerror = () => reject('更新失败');
        } else {
          reject('衣物不存在');
        }
      };

      request.onerror = () => {
        reject('获取衣物失败');
      };
    });
  }

  // 删除衣物
  deleteClothing(id) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initDB()
          .then(() => this.deleteClothing(id))
          .then(resolve)
          .catch(reject);
        return;
      }

      const transaction = this.db.transaction(['clothes'], 'readwrite');
      const store = transaction.objectStore('clothes');
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve('删除成功');
      };

      request.onerror = () => {
        reject('删除失败');
      };
    });
  }

  // 添加收藏
  addCollection(collection) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initDB()
          .then(() => this.addCollection(collection))
          .then(resolve)
          .catch(reject);
        return;
      }

      // 开始事务，同时操作collections和clothes表
      const transaction = this.db.transaction(
        ['collections', 'clothes'],
        'readwrite'
      );
      const collectionsStore = transaction.objectStore('collections');
      const clothesStore = transaction.objectStore('clothes');

      // 添加收藏
      const addRequest = collectionsStore.add(collection);

      addRequest.onsuccess = () => {
        // 更新搭配中每件衣物的使用次数
        if (collection.clothingIds && collection.clothingIds.length > 0) {
          collection.clothingIds.forEach((clothingId) => {
            const getRequest = clothesStore.get(clothingId);
            getRequest.onsuccess = (event) => {
              const clothing = event.target.result;
              if (clothing) {
                // 增加穿着次数
                const updatedClothing = {
                  ...clothing,
                  timesWorn: (clothing.timesWorn || 0) + 1,
                };
                clothesStore.put(updatedClothing);
              }
            };
          });
        }
        resolve('添加成功');
      };

      addRequest.onerror = () => {
        reject('添加失败');
      };
    });
  }

  // 获取所有收藏
  getAllCollections() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initDB()
          .then(() => this.getAllCollections())
          .then(resolve)
          .catch(reject);
        return;
      }

      const transaction = this.db.transaction(['collections'], 'readonly');
      const store = transaction.objectStore('collections');
      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = () => {
        reject('获取失败');
      };
    });
  }

  // 获取单个收藏
  getCollection(id) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initDB()
          .then(() => this.getCollection(id))
          .then(resolve)
          .catch(reject);
        return;
      }

      const transaction = this.db.transaction(['collections'], 'readonly');
      const store = transaction.objectStore('collections');
      const request = store.get(id);

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = () => {
        reject('获取失败');
      };
    });
  }

  // 根据ID列表获取多个衣物
  getClothesByIds(ids) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initDB()
          .then(() => this.getClothesByIds(ids))
          .then(resolve)
          .catch(reject);
        return;
      }

      const transaction = this.db.transaction(['clothes'], 'readonly');
      const store = transaction.objectStore('clothes');
      const clothes = [];
      let completed = 0;

      if (ids.length === 0) {
        resolve(clothes);
        return;
      }

      ids.forEach((id) => {
        const request = store.get(id);
        request.onsuccess = (event) => {
          const clothing = event.target.result;
          if (clothing) {
            clothes.push(clothing);
          }
          completed++;
          if (completed === ids.length) {
            resolve(clothes);
          }
        };
        request.onerror = () => {
          completed++;
          if (completed === ids.length) {
            resolve(clothes);
          }
        };
      });
    });
  }

  // 删除收藏
  deleteCollection(id) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        this.initDB()
          .then(() => this.deleteCollection(id))
          .then(resolve)
          .catch(reject);
        return;
      }

      // 先获取收藏内容，获取 clothingIds
      const getCollectionTransaction = this.db.transaction(
        ['collections'],
        'readonly'
      );
      const getCollectionStore =
        getCollectionTransaction.objectStore('collections');
      const getCollectionRequest = getCollectionStore.get(id);

      getCollectionRequest.onsuccess = () => {
        const collection = getCollectionRequest.result;

        // 开始事务，同时操作collections和clothes表
        const transaction = this.db.transaction(
          ['collections', 'clothes'],
          'readwrite'
        );
        const collectionsStore = transaction.objectStore('collections');
        const clothesStore = transaction.objectStore('clothes');

        // 删除收藏
        const request = collectionsStore.delete(id);

        request.onsuccess = () => {
          // 减少搭配中每件衣物的穿着次数
          if (
            collection &&
            collection.clothingIds &&
            collection.clothingIds.length > 0
          ) {
            collection.clothingIds.forEach((clothingId) => {
              const getRequest = clothesStore.get(clothingId);
              getRequest.onsuccess = (event) => {
                const clothing = event.target.result;
                if (clothing && clothing.timesWorn > 0) {
                  // 减少穿着次数
                  const updatedClothing = {
                    ...clothing,
                    timesWorn: clothing.timesWorn - 1,
                  };
                  clothesStore.put(updatedClothing);
                }
              };
            });
          }
          resolve('删除成功');
        };

        request.onerror = () => {
          reject('删除失败');
        };
      };
    });
  }
}

// 导出单例
const wardrobeDB = new WardrobeDB();
export default wardrobeDB;
