import { makeAutoObservable } from 'mobx';

class UIStore {
  isLoading = false;
  isModalOpen = false;
  modalType = null;
  alertMessage = null;
  alertType = null;
  toastMessage = null;

  constructor() {
    makeAutoObservable(this);
  }

  setLoading(value) {
    this.isLoading = value;
  }

  openModal(type) {
    this.isModalOpen = true;
    this.modalType = type;
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalType = null;
  }

  showAlert(message, type = 'info') {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = null;
      this.alertType = null;
    }, 3000);
  }

  showToast(message) {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }
}

export default new UIStore();
