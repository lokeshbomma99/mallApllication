import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to SuperMall',
      home: 'Home', shop: 'Shop', cart: 'Cart', wishlist: 'Wishlist',
      orders: 'Orders', profile: 'Profile', login: 'Login', register: 'Register', logout: 'Logout',
      addToCart: 'Add to Cart', buyNow: 'Buy Now', outOfStock: 'Out of Stock',
      search: 'Search products...', categories: 'Categories', flashSales: 'Flash Sales',
      myShop: 'My Shop', dashboard: 'Dashboard', products: 'Products', analytics: 'Analytics',
      manageUsers: 'Manage Users', approveShops: 'Approve Shops', settings: 'Settings',
      reviews: 'Reviews', compare: 'Compare', share: 'Share',
    }
  },
  ar: {
    translation: {
      welcome: 'مرحباً بك في سوبر مول',
      home: 'الرئيسية', shop: 'تسوق', cart: 'السلة', wishlist: 'المفضلة',
      orders: 'طلباتي', profile: 'الملف الشخصي', login: 'تسجيل الدخول', register: 'إنشاء حساب', logout: 'خروج',
      addToCart: 'أضف إلى السلة', buyNow: 'اشتر الآن', outOfStock: 'نفد المخزون',
      search: 'ابحث عن منتجات...', categories: 'الفئات', flashSales: 'تخفيضات سريعة',
    }
  },
  hi: {
    translation: {
      welcome: 'SuperMall में आपका स्वागत है',
      home: 'होम', shop: 'शॉप', cart: 'कार्ट', wishlist: 'विशलिस्ट',
      orders: 'ऑर्डर', profile: 'प्रोफाइल', login: 'लॉगिन', register: 'रजिस्टर', logout: 'लॉगआउट',
      addToCart: 'कार्ट में जोड़ें', buyNow: 'अभी खरीदें', outOfStock: 'स्टॉक में नहीं',
      search: 'उत्पाद खोजें...', categories: 'श्रेणियाँ', flashSales: 'फ्लैश सेल',
    }
  },
  gu: {
    translation: {
      welcome: 'SuperMall માં આપનું સ્વાગત છે',
      home: 'હોમ', shop: 'ખરીદી', cart: 'કાર્ટ', wishlist: 'વિશલિસ્ટ',
      orders: 'ઓર્ડર', profile: 'પ્રોફાઇલ', login: 'લૉગિન', register: 'નોંધણી', logout: 'લૉગઆઉટ',
      addToCart: 'કાર્ટમાં ઉમેરો', buyNow: 'હવે ખરીદો', outOfStock: 'સ્ટૉક નથી',
      search: 'ઉત્પાદો શોધો...', categories: 'શ્રેણીઓ', flashSales: 'ફ્લૅશ સેલ',
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
