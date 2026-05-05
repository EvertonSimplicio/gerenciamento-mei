import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from './firebase';
import { User, Transaction, Account } from '../types';

export const firebaseService = {
  // User Profile
  async getUser(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() as User : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      return null;
    }
  },

  async saveUser(user: User): Promise<void> {
    try {
      await setDoc(doc(db, 'users', user.id), user);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
    }
  },

  // Accounts
  async getAccounts(userId: string): Promise<Account[]> {
    try {
      const q = query(collection(db, 'accounts'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const accounts: Account[] = [];
      querySnapshot.forEach((doc) => {
        accounts.push(doc.data() as Account);
      });
      return accounts;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'accounts');
      return [];
    }
  },

  async saveAccount(account: Account): Promise<void> {
    try {
      await setDoc(doc(db, 'accounts', account.id), account);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `accounts/${account.id}`);
    }
  },

  async deleteAccount(accountId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'accounts', accountId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `accounts/${accountId}`);
    }
  },

  // Transactions
  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const transactions: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        transactions.push(doc.data() as Transaction);
      });
      return transactions;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
      return [];
    }
  },

  async saveTransaction(transaction: Transaction): Promise<void> {
    try {
      await setDoc(doc(db, 'transactions', transaction.id), transaction);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `transactions/${transaction.id}`);
    }
  },

  async deleteTransaction(transactionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'transactions', transactionId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `transactions/${transactionId}`);
    }
  },

  // Real-time listeners
  subscribeToTransactions(userId: string, callback: (txs: Transaction[]) => void) {
    const q = query(collection(db, 'transactions'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const txs: Transaction[] = [];
      snapshot.forEach((doc) => txs.push(doc.data() as Transaction));
      callback(txs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });
  },

  subscribeToAccounts(userId: string, callback: (accs: Account[]) => void) {
    const q = query(collection(db, 'accounts'), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const accs: Account[] = [];
      snapshot.forEach((doc) => accs.push(doc.data() as Account));
      callback(accs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'accounts');
    });
  }
};
