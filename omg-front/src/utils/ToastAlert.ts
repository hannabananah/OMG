import Swal from 'sweetalert2';
import 'tailwindcss/tailwind.css';

export const ToastAlert = (message: string) => {
  Swal.fire({
    toast: true,
    position: 'top',
    iconHtml: '<img src="/favicon.ico" alt="custom-icon" class="w-10 h-10"/>',
    title: message,
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    customClass: {
      popup:
        'flex items-center rounded-10 text-white px-3 py-3 text-omg-28 justify-center max-w-3xl',
      timerProgressBar: 'bg-white',
      icon: 'no-icon-style',
      title: 'flex-grow text-left',
    },
    width: 'auto',
    background:
      'linear-gradient(rgba(1, 30, 118, 0.8), rgba(1, 30, 118, 0.8)),  url("/assets/alert.jpeg") no-repeat center center',
    didOpen: toast => {
      const parentElement = toast.parentNode as HTMLElement;
      parentElement?.classList.add('pt-20');
      toast.style.backgroundSize = 'cover';
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
};
