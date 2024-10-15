import Swal from 'sweetalert2';
import 'tailwindcss/tailwind.css';

export const ConfirmAlert = (message: string, onConfirm: () => void) => {
  Swal.fire({
    title: message,
    position: 'center',
    iconHtml: '<img src="/favicon.ico" alt="custom-icon" class="w-16 h-16"/>',
    showCancelButton: true,
    confirmButtonText: '네',
    cancelButtonText: '아니오',
    reverseButtons: true,
    customClass: {
      popup:
        'flex flex-col p-20 pb-24 gap-4 items-center justify-center rounded-20 text-white w-[50%]',
      icon: 'no-icon-style',
      confirmButton: 'bg-skyblue text-omg-24 text-black mx-2 w-48',
      cancelButton: 'bg-lightgray text-omg-24 text-black mx-2 w-48',
      title: 'text-omg-32',
    },
    width: 'auto',
    background: 'url("/assets/matrix.gif")',
    didOpen: toast => {
      toast.style.backgroundSize = 'cover';
    },
  }).then(result => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
};
