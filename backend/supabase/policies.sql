ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site content" ON public.site_content
FOR SELECT USING (true);

CREATE POLICY "Public can read services" ON public.services
FOR SELECT USING (true);

CREATE POLICY "Public can read skills" ON public.skills
FOR SELECT USING (true);

CREATE POLICY "Public can read tools" ON public.tools
FOR SELECT USING (true);

CREATE POLICY "Public can read projects" ON public.projects
FOR SELECT USING (true);

CREATE POLICY "Public can read portfolio categories" ON public.portfolio_categories
FOR SELECT USING (true);

CREATE POLICY "Public can read resume" ON public.resume
FOR SELECT USING (true);

CREATE POLICY "Public can read contact info" ON public.contact_info
FOR SELECT USING (true);

CREATE POLICY "Admin can manage site content" ON public.site_content
FOR ALL TO authenticated
USING (auth.email() = 'ley@example.com')
WITH CHECK (auth.email() = 'ley@example.com');

CREATE POLICY "Admin can manage services" ON public.services
FOR ALL TO authenticated
USING (auth.email() = 'ley@example.com')
WITH CHECK (auth.email() = 'ley@example.com');

CREATE POLICY "Admin can manage skills" ON public.skills
FOR ALL TO authenticated
USING (auth.email() = 'ley@example.com')
WITH CHECK (auth.email() = 'ley@example.com');

CREATE POLICY "Admin can manage tools" ON public.tools
FOR ALL TO authenticated
USING (auth.email() = 'ley@example.com')
WITH CHECK (auth.email() = 'ley@example.com');

CREATE POLICY "Admin can manage projects" ON public.projects
FOR ALL TO authenticated
USING (auth.email() = 'ley@example.com')
WITH CHECK (auth.email() = 'ley@example.com');

CREATE POLICY "Admin can manage portfolio categories" ON public.portfolio_categories
FOR ALL TO authenticated
USING (auth.email() = 'ley@example.com')
WITH CHECK (auth.email() = 'ley@example.com');

CREATE POLICY "Admin can manage resume" ON public.resume
FOR ALL TO authenticated
USING (auth.email() = 'ley@example.com')
WITH CHECK (auth.email() = 'ley@example.com');

CREATE POLICY "Admin can manage contact info" ON public.contact_info
FOR ALL TO authenticated
USING (auth.email() = 'ley@example.com')
WITH CHECK (auth.email() = 'ley@example.com');
