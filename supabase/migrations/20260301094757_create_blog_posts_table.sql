/*
  # Create blog_posts table

  ## Summary
  Creates a fully-managed blog posts table that powers the prywaciarz.com blog.
  Posts are managed through the admin panel and displayed newest-first on the site.

  ## New Tables
  - `blog_posts`
    - `id` (uuid, primary key)
    - `slug` (text, unique) - URL-friendly identifier
    - `title` (text) - Post headline
    - `description` (text) - Short meta description for SEO
    - `content` (text) - Full markdown content
    - `author` (text) - Author display name, defaults to 'Zespół Prywaciarz'
    - `keywords` (text[]) - SEO keyword array
    - `read_time` (integer) - Estimated read time in minutes
    - `published` (boolean) - Draft/published toggle, defaults false
    - `published_at` (timestamptz) - Publication timestamp
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Public (anon) can SELECT only published posts
  - Authenticated admin can SELECT, INSERT, UPDATE, DELETE all posts

  ## Notes
  1. Posts ordered by published_at DESC (newest first)
  2. Seed data migrates existing hardcoded blog posts from blog.ts
*/

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT 'Zespół Prywaciarz',
  keywords text[] NOT NULL DEFAULT '{}',
  read_time integer NOT NULL DEFAULT 5,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Admin can read all posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'admin@prywaciarz.com');

CREATE POLICY "Admin can insert posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = 'admin@prywaciarz.com');

CREATE POLICY "Admin can update posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'admin@prywaciarz.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'admin@prywaciarz.com');

CREATE POLICY "Admin can delete posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'admin@prywaciarz.com');

CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

INSERT INTO blog_posts (slug, title, description, content, author, keywords, read_time, published, published_at) VALUES
(
  'jak-zarejestrowac-karte-sim-bez-wychodzenia-z-domu',
  'Jak zarejestrować kartę SIM bez wychodzenia z domu w 2026 roku?',
  'Pełny przewodnik rejestracji karty SIM bez konieczności wizyty w sklepie. Poznaj nowoczesne sposoby rejestracji online.',
  E'# Jak zarejestrować kartę SIM bez wychodzenia z domu w 2026 roku?\n\n## Wprowadzenie\n\nW erze cyfryzacji, rejestracja karty SIM nie musi już wiązać się z wizytą w sklepie operatora. W tym artykule pokażemy Ci nowoczesne sposoby, aby zarejestrować kartę SIM wygodnie z domu.\n\n## Metoda 1: Rejestracja Online na Stronie Operatora\n\n### Orange\n\n1. Przejdź na stronę **orange.pl**\n2. Wybierz opcję "Moje konto"\n3. Wprowadź numer karty SIM\n4. Potwierdź tożsamość poprzez SMS weryfikacyjny\n5. Uzupełnij dane personalne\n6. Poczekaj na potwierdzenie (zwykle 10-15 minut)\n\n### Play\n\n1. Wejdź na **play.pl/rejestracja**\n2. Kliknij "Zarejestruj kartę"\n3. Podaj numer IMEI (znajdziesz go w opakowaniu)\n4. Weryfikacja SMS\n5. Zgoda na regulamin\n6. Gotowe!\n\n## Metoda 2: Rejestracja poprzez Aplikację Mobilną\n\nWiększość operatorów ma własne aplikacje mobilne, które umożliwiają rejestrację:\n\n- Orange Mój Orange\n- Play - Moja Karta\n- T-Mobile - T-Mobile\n- Plus - Moja Plus\n\nPo pobraniu aplikacji wystarczy:\n1. Logowanie lub rejestracja\n2. Dodanie nowej karty SIM\n3. Weryfikacja tożsamości\n4. Czekanie na aktywację\n\n## Jak długo trwa rejestracja?\n\n- Rejestracja online: 10-30 minut\n- Rejestracja przez aplikację: 5-10 minut\n- Potwierdzenie karty: do 24 godzin\n\n## Podsumowanie\n\nRejestracja karty SIM w domu jest teraz prostsza niż kiedykolwiek. Wybierz metodę, która Ci najbardziej odpowiada.\n\n**Potrzebujesz kart SIM już zarejestrowanych? Sprawdź naszą ofertę!**',
  'Zespół Prywaciarz',
  ARRAY['karta SIM', 'rejestracja SIM', 'zdalna rejestracja', 'anonimowa karta SIM', 'rejestracja online'],
  8,
  true,
  '2026-02-15 10:00:00+00'
),
(
  'dlaczego-anonimowa-rejestracja-karty-sim-jest-wazna',
  'Dlaczego anonimowa rejestracja karty SIM jest ważna dla Twojego bezpieczeństwa?',
  'Dowiedz się, dlaczego prywatna rejestracja karty SIM to kluczowy element bezpieczeństwa w internecie.',
  E'# Dlaczego anonimowa rejestracja karty SIM jest ważna dla Twojego bezpieczeństwa?\n\n## Zagrożenia Tradycyjnej Rejestracji\n\nW dzisiejszych czasach liczba incydentów bezpieczeństwa związanych z danymi osobowymi rośnie wykładniczo. Tradycyjna rejestracja karty SIM wiąże się z ujawnieniem:\n\n- Imienia i nazwiska\n- Adresu zamieszkania\n- PESEL\n- Numeru paszportu\n\n## Ryzyka Ujawnienia Danych\n\n### 1. Kradzież Tożsamości\n\nPrzestępcy mogą użyć Twoich danych do:\n- Zaciągnięcia kredytów\n- Otwarcia kont bankowych\n- Tworzenia fałszywych kont na mediach społecznych\n\n### 2. Tracking i Nadzór\n\nFirmy technologiczne mogą śledzić:\n- Twoją lokalizację\n- Historię przeglądania\n- Zwyczaje zakupowe\n\n### 3. Cyberprzestępczość\n\nNumer telefonu połączony z Twoją tożsamością to łatwy cel dla hakerów i cyberprzestępców.\n\n## Korzyści Anonimowej Rejestracji\n\n### Pełna Prywatność\n\nAnonimowa karta SIM nie zawiera Twoich danych osobowych w bazach operatorów. Oznacza to:\n- Brak możliwości śledzenia\n- Brak ryzyka kradzieży tożsamości\n- Pełna kontrola nad swoją prywatnością\n\n### Ochrona przed Hakerami\n\nHackerzy szukają połączeń między numerem telefonu a Twoją tożsamością. Anonimowa karta SIM zrywa te połączenia i chroni Twoją cyfrową tożsamość.\n\n## Legalne Zastosowania\n\nAnonimowa rejestracja karty SIM to całkowicie legalne rozwiązanie z wieloma uzasadnionymi zastosowaniami:\n\n- **Bezpieczeństwo osobiste**: Unikanie harassmentu online\n- **Działalność zawodowa**: Ochrona numeru biznesowego\n- **Prywatność**: Prawo do prywatności gwarantowane konstytucją\n\n## Podsumowanie\n\nW świecie, gdzie dane są nowym złotem, anonimowa rejestracja karty SIM to inwestycja w Twoje bezpieczeństwo.\n\n**Gotów chronić swoją prywatność? Sprawdź nasze anonimowe karty SIM!**',
  'Zespół Prywaciarz',
  ARRAY['anonimowa rejestracja karty SIM', 'prywatność', 'bezpieczeństwo', 'incognito SIM', 'anonimowość'],
  10,
  true,
  '2026-02-12 10:00:00+00'
),
(
  'e-sim-vs-fizyczna-karta-sim-co-wybrac',
  'E-SIM vs fizyczna karta SIM – co wybrać dla maksymalnej prywatności?',
  'Porównanie e-SIM i tradycyjnych kart SIM. Która opcja jest lepsza dla Twojej prywatności?',
  E'# E-SIM vs fizyczna karta SIM – co wybrać dla maksymalnej prywatności?\n\n## Co to jest E-SIM?\n\nE-SIM (Embedded SIM) to cyfrowa karta SIM zintegrowana z Twoim urządzeniem. Przechowuje dane operatora w oprogramowaniu zamiast na fizycznym chipie.\n\n## Porównanie: Bezpieczeństwo\n\n### E-SIM — Zalety:\n- Brak fizycznego chipa do kradzieży\n- Szyfrowanie na poziomie urządzenia\n- Trudniejszy dostęp dla cyberprzestępców\n\n### E-SIM — Wady:\n- Operator może przechowywać historię zmian\n- Mniej możliwości anonimowości\n\n### Tradycyjna Karta SIM — Zalety:\n- Łatwiej uniknąć śledzenia\n- Możliwość pełnej anonimowości\n- Niezależna od urządzenia\n\n## Prywatność: Które Rozwiązanie Wybrać?\n\n### Dla Maksymalnej Anonimowości\n\n**Rekomendacja: Tradycyjna Karta SIM**\n\nJeśli Twoim głównym celem jest anonimowość, tradycyjna karta SIM oferuje więcej możliwości — można ją kupić bez rejestracji, nie jest powiązana z urządzeniem.\n\n### Dla Bezpieczeństwa Przed Hakerami\n\n**Rekomendacja: E-SIM**\n\nJeśli zależy Ci na bezpieczeństwie przed cyberatakami, e-SIM z szyfrowaniem na poziomie systemu jest lepszym wyborem.\n\n## Praktyczne Podsumowanie\n\n| Aspekt | E-SIM | Tradycyjna SIM |\n|--------|-------|----------------|\n| Anonimowość | Średnia | Wysoka |\n| Bezpieczeństwo | Wysoka | Średnia |\n| Elastyczność | Wysoka | Wysoka |\n\n## Podsumowanie\n\nWybór zależy od Twoich potrzeb:\n- Szukasz anonimowości? Tradycyjna SIM\n- Szukasz bezpieczeństwa? E-SIM\n\n**Odkryj nasze opcje kart SIM i wybierz najlepsze rozwiązanie dla siebie!**',
  'Zespół Prywaciarz',
  ARRAY['e-SIM', 'karta SIM', 'prywatność', 'prywatne urządzenia', 'technologia'],
  9,
  true,
  '2026-02-08 10:00:00+00'
);
