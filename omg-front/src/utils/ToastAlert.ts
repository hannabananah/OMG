import Swal from 'sweetalert2';
import 'tailwindcss/tailwind.css';

export const ToastAlert = (message: string) => {
  Swal.fire({
    toast: true,
    position: 'top',
    iconHtml: '<img src="/favicon.ico" alt="custom-icon" class="w-8 h-8"/>',
    title: message,
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    customClass: {
      popup:
        'bg-blue flex items-center rounded-10 text-white px-4 py-3 text-omg-18 justify-center max-w-2xl',
      timerProgressBar: 'bg-white',
      icon: 'no-icon-style',
    },
    width: 'auto',
    didOpen: toast => {
      const parentElement = toast.parentNode as HTMLElement;
      parentElement?.classList.add('pt-28');
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
};
