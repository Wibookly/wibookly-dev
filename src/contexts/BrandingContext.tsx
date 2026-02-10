import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import wibooklyLogo from '@/assets/wibookly-logo.png';

interface BrandingConfig {
  brandName: string;
  logoUrl: string;
  isWhiteLabeled: boolean;
  loading: boolean;
}

const defaultBranding: BrandingConfig = {
  brandName: 'Wibookly',
  logoUrl: wibooklyLogo,
  isWhiteLabeled: false,
  loading: true,
};

const BrandingContext = createContext<BrandingConfig>(defaultBranding);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);

  useEffect(() => {
    detectBranding();
  }, []);

  const detectBranding = async () => {
    try {
      const hostname = window.location.hostname;
      
      // Extract subdomain slug: e.g. "clientname.wibookly.ai" -> "clientname"
      // Also handle "clientname.lovable.app" for preview
      let slug: string | null = null;
      
      if (hostname.includes('.wibookly.ai')) {
        const parts = hostname.split('.wibookly.ai')[0];
        if (parts && parts !== 'app' && parts !== 'www') {
          slug = parts;
        }
      } else if (hostname.includes('.lovable.app')) {
        // For preview/dev, check if there's a query param ?brand=slug
        const params = new URLSearchParams(window.location.search);
        slug = params.get('brand');
      }

      if (!slug) {
        setBranding({ ...defaultBranding, loading: false });
        return;
      }

      // Look up white-label config by subdomain using the security definer function
      const { data, error } = await supabase.rpc('get_white_label_by_subdomain', {
        _slug: slug,
      });

      if (!error && data && data.length > 0 && data[0].is_enabled) {
        setBranding({
          brandName: data[0].brand_name || 'Wibookly',
          logoUrl: data[0].logo_url || wibooklyLogo,
          isWhiteLabeled: true,
          loading: false,
        });
      } else {
        setBranding({ ...defaultBranding, loading: false });
      }
    } catch {
      setBranding({ ...defaultBranding, loading: false });
    }
  };

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
