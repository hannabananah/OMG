/** @type {import('tailwindcss').Config} */

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  important: true,
  theme: {
    fontSize: {
      'omg-10': '0.6rem', // 10px
      'omg-11': '0.8rem', // 11px
      'omg-14': '1rem', // 14px로 적용
      'omg-18': '1.29rem', // 18px
      'omg-20': '1.43rem', // 20px
      'omg-24': '1.71rem', // 24px
      'omg-28': '2rem', // 28px
      'omg-30': '2.14rem', // 30px

      'omg-24b': '1.71rem', // 24px
      'omg-28b': '2rem', // 28px
      'omg-30b': '2.14rem',
      'omg-40b': '2.86rem', // 40px
      'omg-50b': '3.57rem', // 50px
      'omg-100b': '7.14rem', // 100px
    },
    borderWidth: {
      1: '1px',
      4: '4px',
      5: '5px',
    },
    borderRadius: {
      5: '5px',
      10: '10px',
      20: '20px',
      30: '30px',
      40: '40px',
      100: '100px',
    },
    extend: {
      fontFamily: {
        'omg-title': 'OKDDUNG',
        'omg-body': 'Katuri',
        'omg-chat': 'SUITE',
        'omg-event-title': 'Partial',
        'omg-event-content': 'Laundry',
      },
      colors: {
        white1: '#FFFFFF',
        white2: '#F6F6F6',
        white3: '#E0E0E0',
        'white-trans50': '#FFFFFF',
        'white-trans80': '#FFFFFF',
        'white-trans90': '#FFFAFA',
        black: '#000000',
        'black-trans70': '#000000',
        red: '#D83232',
        green: '#1EAE15',
        skyblue: '#71FFFF',
        purple: '#AB18F4',
        blue: '#0371F8',
        gray: '#888',
        lightgray: '#ddd',
      },
      dropShadow: {
        heavy: '0 10px 15px rgba(0, 0, 0, 1)',
      },
    },
  },
  plugins: [],
};
