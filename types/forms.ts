export type SlideData = {
  id: string;
  judul: string;
  linkText: string;
  linkHref: string;
  foto: File | null;
  currentFotoUrl: string;
};

export type ParsedSlide = {
  id?: string;
  title?: string;
  linkText?: string;
  linkHref?: string;
  image?: string;
};

export type ProfileSection = {
  id: string;
  title: string;
  description: string;
  foto: File | null;
  currentFotoUrl: string;
};
