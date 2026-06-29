export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'sim' | 'vpn' | 'voip' | 'grapheneos' | 'general';
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'sim-registration-legal',
    category: 'sim',
    question: 'Czy rejestracja anonimowej karty SIM jest legalna?',
    answer: 'Tak, całkowicie legalna. Prawo do prywatności jest gwarantowane przez konstytucję. Anonimowa rejestracja karty SIM jest legalna w Polsce i większości krajów europejskich. Nasi klienci to ludzie, którzy cenią sobie prywatność i bezpieczeństwo.',
  },
  {
    id: 'sim-activation-time',
    category: 'sim',
    question: 'Jak długo aktywuje się karta SIM?',
    answer: 'Karty SIM aktywują się zwykle w ciągu 10-30 minut od zakupu. W niektórych przypadkach może to zająć do 24 godzin. Po aktywacji możesz natychmiast odbierać SMS i dzwonić.',
  },
  {
    id: 'sim-which-operator',
    category: 'sim',
    question: 'Które operatory obsługujecie?',
    answer: 'Oferujemy karty od wszystkich głównych polskich operatorów: Orange, Play, T-mobile, Plus, Virgin Mobile i innych. Każda karta to inny operator - wybierz preferencje przy zakupie.',
  },
  {
    id: 'sim-delivery',
    category: 'sim',
    question: 'Jak przesyłacie karty SIM?',
    answer: 'Karty wysyłamy za pośrednictwem sieci Inpost Paczkomat. Przesyłka jest bezpieczna i anonimowa. Wystarczy podać adres paczkomatu, a kartę odbierzesz w swoim czasie.',
  },
  {
    id: 'vpn-logging',
    category: 'vpn',
    question: 'Czy Wasza usługa VPN prowadzi logi?',
    answer: 'Absolutnie nie. Nasza polityka zero logów oznacza, że nie przechowujemy żadnych informacji o Twojej aktywności. Twoja prywatność jest dla nas priorytetem.',
  },
  {
    id: 'vpn-speed',
    category: 'vpn',
    question: 'Jaka jest prędkość połączenia VPN?',
    answer: 'Nasz serwer VPN oferuje wysoką prędkość bez ograniczeń bandwidth. Pełną prędkość Twojego internetu możesz osiągnąć dzięki dedykowanym serwerom. Prędkość wynosi zwykle 80-95% Twojej normalnej prędkości.',
  },
  {
    id: 'vpn-countries',
    category: 'vpn',
    question: 'Z jakich krajów możemy łączyć się z VPN?',
    answer: 'Nasz VPN obsługuje połączenia z różnych lokalizacji. Po nabyciu usługi otrzymasz pełne informacje o dostępnych serwerach i instrukcjach konfiguracji.',
  },
  {
    id: 'voip-forwarding',
    category: 'voip',
    question: 'Czy mogę przesyłać połączenia na VoIP?',
    answer: 'Tak, możesz ustawiać przekierowania połączeń. Po aktywacji numeru VoIP otrzymasz dostęp do panelu kontroli, gdzie skonfigurujesz wszystkie ustawienia.',
  },
  {
    id: 'voip-duration',
    category: 'voip',
    question: 'Na jak długo otrzymuję numer VoIP?',
    answer: 'Numer VoIP działa na wybraną przez Ciebie długość czasu. Możesz przedłużyć subskrypcję w dowolnym momencie bez dodatkowych opłat aktywacyjnych.',
  },
  {
    id: 'grapheneos-what-is',
    category: 'grapheneos',
    question: 'Co to jest GrapheneOS?',
    answer: 'GrapheneOS to zaawansowany system operacyjny oparty na Androidzie, skupiający się na bezpieczeństwie i prywatności. Udostępnia pełną kontrolę nad uprawnieniami aplikacji i eliminuje śledzenie przez Google.',
  },
  {
    id: 'grapheneos-apps',
    category: 'grapheneos',
    question: 'Czy mogę zainstalować zwykłe aplikacje na GrapheneOS?',
    answer: 'Tak, jednak musisz być ostrożny. Rekomendujemy instalowanie aplikacji tylko z zaufanych źródeł. GrapheneOS wspiera F-Droid i inne alternatywne sklepy aplikacji.',
  },
  {
    id: 'grapheneos-update',
    category: 'grapheneos',
    question: 'Jak często GrapheneOS jest aktualizowany?',
    answer: 'GrapheneOS otrzymuje regularne aktualizacje bezpieczeństwa i poprawki błędów. System sam powiadamia Cię o dostępnych aktualizacjach, które można zainstalować natychmiast.',
  },
  {
    id: 'payment-methods',
    category: 'general',
    question: 'Jakie metody płatności akceptujecie?',
    answer: 'Akceptujemy karty prepaid (PSC) i Bitcoin. Wszystkie transakcje są w pełni anonimowe i bezpieczne. Nie przechowujemy danych karty kredytowej.',
  },
  {
    id: 'account-data',
    category: 'general',
    question: 'Jakie dane zbierapie od klientów?',
    answer: 'Zbieramy tylko dane niezbędne do realizacji zamówienia: email i opcjonalnie numer telefonu. Nie sprzedajemy danych do stron trzecich. Wszystko pozostaje prywatne.',
  },
  {
    id: 'refund-policy',
    category: 'general',
    question: 'Jaka jest polityka zwrotów?',
    answer: 'Zwroty są możliwe w ciągu 14 dni od zakupu, o ile produkt nie został aktywowany. Skontaktuj się z nami, a my poznawcimy wszystkie szczegóły.',
  },
  {
    id: 'support',
    category: 'general',
    question: 'Jak mogę skontaktować się z obsługą?',
    answer: 'Skontaktuj się z nami przez formularz kontaktowy na stronie. Odpowiadamy na wszystkie zapytania w ciągu 24 godzin. Możesz też wysłać email na nasz adres.',
  },
];
