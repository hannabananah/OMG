import Swal from 'sweetalert2';
import 'tailwindcss/tailwind.css';

export const ToastAlert = (message: string) => {
  Swal.fire({
    toast: true,
    position: 'top',
    iconHtml: '<img src="/favicon.ico" alt="custom-icon" class="w-8 h-8"/>',
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup:
        'flex items-center rounded-10 text-white px-4 py-3 text-omg-20 justify-center max-w-3xl',
      timerProgressBar: 'bg-white',
      icon: 'no-icon-style',
    },
    width: 'auto',
    background:
      'linear-gradient(rgba(1, 30, 118, 0.8), rgba(1, 30, 118, 0.8)),  url("/assets/alert.jpeg") no-repeat center center',
    didOpen: toast => {
      const parentElement = toast.parentNode as HTMLElement;
      parentElement?.classList.add('pt-28');
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
};
