import {toast} from 'sonner';

const showSuccess = (message) => {
    toast.success(message)
}

const showError = (message) => {
    toast.error(message)
}

const showWarning = (message) => {
    toast.warning(message)
}

const showInfo = (message) => {
    toast.info(message)
}

export {
    showError, showInfo, showSuccess, showWarning
}