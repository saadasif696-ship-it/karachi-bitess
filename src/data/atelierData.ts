import heroFastfoodSeatingImg from '../assets/images/hero_modern_fastfood_seating_1794986215774.jpg';
import modernBoothLoungeImg from '../assets/images/seating_modern_lounge_1794986233286.jpg';
import wagyuNihari1 from '../assets/images/products/wagyu_nihari_1.jpg';
import wagyuNihari2 from '../assets/images/products/wagyu_nihari_2.jpg';
import wagyuNihari3 from '../assets/images/products/wagyu_nihari_3.jpg';
import prawnTehri1 from '../assets/images/products/prawn_tehri_1.jpg';
import prawnTehri2 from '../assets/images/products/prawn_tehri_2.jpg';
import prawnTehri3 from '../assets/images/products/prawn_tehri_3.jpg';
import saffronBiryani1 from '../assets/images/products/saffron_biryani_1.jpg';
import saffronBiryani2 from '../assets/images/products/saffron_biryani_2.jpg';
import saffronBiryani3 from '../assets/images/products/saffron_biryani_3.jpg';
import lambChops1 from '../assets/images/products/lamb_chops_1.jpg';
import lambChops2 from '../assets/images/products/lamb_chops_2.jpg';
import lambChops3 from '../assets/images/products/lamb_chops_3.jpg';
import shahiHaleem1 from '../assets/images/products/shahi_haleem_1.jpg';
import shahiHaleem2 from '../assets/images/products/shahi_haleem_2.jpg';
import shahiHaleem3 from '../assets/images/products/shahi_haleem_3.jpg';
import bihariFlight1 from '../assets/images/products/bihari_flight_1.jpg';
import bihariFlight2 from '../assets/images/products/bihari_flight_2.jpg';
import bihariFlight3 from '../assets/images/products/bihari_flight_3.jpg';

export type BranchId = 'clifton' | 'dha' | 'tariq';

export type CourseCategory =
  | 'All Courses'
  | 'Heirloom Mains'
  | 'Charcoal & Hearth'
  | 'Biryani & Dum'
  | 'Cellar & Chai';

export interface BranchInfo {
  id: BranchId;
  name: string;
  shortLabel: string;
  district: string;
  address: string;
  hours: string;
  phone: string;
  chefNote: string;
  exclusiveFeature: string;
  valetNote: string;
}

export interface DishItem {
  id: string;
  name: string;
  category: Exclude<CourseCategory, 'All Courses'>;
  heritageLabel: string;
  exclusiveBranch?: BranchId;
  branchTag: string;
  pricePkr: number;
  servingNote: string;
  shortDescription: string;
  provenance: string;
  spiceProfile: string;
  recommendedPairing: string;
  allergens: string;
  image: string;
  images: [string, string, string];
  imageAlt: string;
}

export interface PrivateSuite {
  id: string;
  name: string;
  branchId: BranchId;
  branchName: string;
  capacity: string;
  minimumSpendPkr: number;
  summary: string;
  details: string[];
  image: string;
  imageAlt: string;
}

export interface CellarPairing {
  id: string;
  name: string;
  origin: string;
  notes: string;
  pricePkr: number;
}

export const HERO_MEDIA = {
  image: heroFastfoodSeatingImg,
  alt: 'Modern flagship Karachi Bites dining and seating lounge with tufted black leather booths, brass-accented tables, and fast-casual order counter',
};

export const BRANCHES: BranchInfo[] = [
  {
    id: 'clifton',
    name: 'Clifton Block 4 Atelier',
    shortLabel: 'Clifton',
    district: 'Marine Promenade, Clifton Block 4',
    address: 'Plot 14-C, Marine Promenade, Block 4, Clifton, Karachi',
    hours: '18:30 – 01:00 Daily',
    phone: '+92 21 3583 0419',
    chefNote: '14-seat Chef’s Counter & Sea-Breeze Salon',
    exclusiveFeature: 'Features 24K Wagyu Bone Marrow Nihari & Coastal Tasting',
    valetNote: 'Private porte-cochère valet arrival at Marine Promenade.',
  },
  {
    id: 'dha',
    name: 'DHA Phase 6 Pavilion',
    shortLabel: 'DHA Phase 6',
    district: 'Bukhari Commercial, DHA Phase 6',
    address: '88 Khayaban-e-Bukhari, Phase 6, Defence Housing Authority, Karachi',
    hours: '18:00 – 01:00 Daily',
    phone: '+92 21 3524 8810',
    chefNote: 'Charcoal Robata Courtyard & Private Suites',
    exclusiveFeature: 'Features Smoked Peshawari Raan & Courtyard Pairing Bar',
    valetNote: 'Discreet courtyard entrance with dedicated chauffeur lounge.',
  },
  {
    id: 'tariq',
    name: 'Tariq Road Heritage Vault',
    shortLabel: 'Tariq Road',
    district: 'Original 1984 Hearth, PECHS Block 2',
    address: '214-A Central Lane, Off Tariq Road, PECHS Block 2, Karachi',
    hours: '19:00 – 02:00 Daily',
    phone: '+92 21 3453 1984',
    chefNote: 'Original 1984 Copper Handi Vault',
    exclusiveFeature: 'Features Late-Night Copper-Pot Haleem & Heirloom Dum Pukht',
    valetNote: 'Valet reception directly outside the Heritage Vault gates.',
  },
];

export const COURSE_CATEGORIES: CourseCategory[] = [
  'All Courses',
  'Heirloom Mains',
  'Charcoal & Hearth',
  'Biryani & Dum',
  'Cellar & Chai',
];

export const MENU_DISHES: DishItem[] = [
  {
    id: 'wagyu-nihari',
    name: '24K Wagyu Bone Marrow Nihari',
    category: 'Heirloom Mains',
    heritageLabel: 'Slow-Simmered 14 Hours',
    exclusiveBranch: 'clifton',
    branchTag: 'Clifton Exclusive',
    pricePkr: 7400,
    servingNote: 'Served with Roghni Khamiri Naan & Pickled Shallots',
    shortDescription:
      'Japanese A4 chuck rib braised overnight in roasted long-pepper jus, finished with scorched bone marrow and edible gold leaf.',
    provenance:
      'Inspired by our founder’s 1984 Burns Road spice mill recipe, elevated with Miyazaki-grade marbled beef and cold-pressed mustard oil.',
    spiceProfile: 'Warm long pepper (pipli), green cardamom, star anise, ginger julienne',
    recommendedPairing: 'Smoked Black Cardamom & Dried Plum Elixir',
    allergens: 'Gluten (naan), Dairy (clarified ghee)',
    image: wagyuNihari1,
    images: [wagyuNihari1, wagyuNihari2, wagyuNihari3],
    imageAlt: '24K Wagyu Bone Marrow Nihari in a matte black stoneware bowl with gold leaf and marrow bone',
  },
  {
    id: 'saffron-dum-biryani',
    name: 'Shahi Kashmiri Saffron Mutton Biryani',
    category: 'Biryani & Dum',
    heritageLabel: 'Dum Pukht Classic',
    branchTag: 'All Enclaves',
    pricePkr: 5600,
    servingNote: 'Sealed in Blackened Copper Handi with Mint Raita',
    shortDescription:
      'Two-year aged Himalayan basmati steamed over tender Sindhi goat shoulder, infused with Pampore saffron and silver varq.',
    provenance:
      'Dough-sealed at the table and opened moments before service so the first plume of kewra and saffron smoke reaches the guest.',
    spiceProfile: 'Kashmiri saffron, rosewater, crispy caramelized onion, black cumin',
    recommendedPairing: 'Sindhi Rose & Saffron Sparkling Sherbet',
    allergens: 'Dairy (yogurt raita, ghee)',
    image: saffronBiryani1,
    images: [saffronBiryani1, saffronBiryani2, saffronBiryani3],
    imageAlt: 'Shahi Kashmiri Saffron Mutton Biryani served in a hammered copper handi pot',
  },
  {
    id: 'peshawari-charcoal-raan',
    name: 'Ember-Seared Lamb Chops & Smoked Seekh',
    category: 'Charcoal & Hearth',
    heritageLabel: 'Binchotan & Acacia Smoke',
    exclusiveBranch: 'dha',
    branchTag: 'DHA Phase 6 Signature',
    pricePkr: 6900,
    servingNote: 'Plated on Basalt with Charred Leek Ash & Pomegranate',
    shortDescription:
      '24-hour raw papaya and black pepper marinated lamb rack paired with hand-minced wagyu seekh over white acacia embers.',
    provenance:
      'Dry-aged for fourteen days in our Bukhari cold cellar before kissing live acacia charcoal for crisp caramelization.',
    spiceProfile: 'Crushed Tellicherry peppercorn, roasted coriander, sumac, pomegranate',
    recommendedPairing: 'Kashmiri Zafrani Kahwa Reserve',
    allergens: 'None in main protein; labneh dip contains dairy',
    image: lambChops1,
    images: [lambChops1, lambChops2, lambChops3],
    imageAlt: 'Charcoal-seared lamb chops and smoked seekh kebabs on dark basalt slate',
  },
  {
    id: 'copper-pot-haleem',
    name: '1984 Copper-Pot Shahi Haleem',
    category: 'Heirloom Mains',
    heritageLabel: 'Heritage Vault Recipe',
    exclusiveBranch: 'tariq',
    branchTag: 'Tariq Road Original',
    pricePkr: 4200,
    servingNote: 'Finished Tableside with Browned Desi Ghee & Crispy Garlic',
    shortDescription:
      'Hand-pounded heirloom wheat, four coastal lentils, and shredded slow-braised veal beaten to a velvety silk consistency.',
    provenance:
      'Stirred continuously with seasoned teakwood paddles for nine hours in tinned copper cauldrons—unchanged since 1984.',
    spiceProfile: 'Nutmeg, mace, toasted cumin, green chili, fresh coriander',
    recommendedPairing: 'Charred Lime & Pink Salt Shikanjabeen',
    allergens: 'Gluten (cracked wheat), Dairy (ghee)',
    image: shahiHaleem1,
    images: [shahiHaleem1, shahiHaleem2, shahiHaleem3],
    imageAlt: 'Rich slow-simmered copper-pot shahi haleem garnished with golden ginger and crispy shallots',
  },
  {
    id: 'sindhi-prawn-dum',
    name: 'Arabian Sea Tiger Prawn Tehri',
    category: 'Biryani & Dum',
    heritageLabel: 'Coastal Atelier Edition',
    exclusiveBranch: 'clifton',
    branchTag: 'Clifton Exclusive',
    pricePkr: 6400,
    servingNote: 'Served with Smoked Tamarind & Curry Leaf Chutney',
    shortDescription:
      'Line-caught Kemari jumbo prawns folded into saffron-turmeric rice with toasted kokum, fennel, and charred garlic butter.',
    provenance:
      'Harvested each morning from deep-water Arabian Sea vessels and cooked over gentle coconut-husk embers.',
    spiceProfile: 'Turmeric root, roasted fennel seed, kokum tang, curry leaf',
    recommendedPairing: 'Sindhi Rose & Saffron Sparkling Sherbet',
    allergens: 'Shellfish, Dairy (butter)',
    image: prawnTehri1,
    images: [prawnTehri1, prawnTehri2, prawnTehri3],
    imageAlt: 'Aromatic saffron rice tehri crowned with roasted Kemari tiger prawns on dark obsidian marble',
  },
  {
    id: 'charcoal-resha-boti',
    name: 'Smoked Beef Bihari & Malai Boti Flight',
    category: 'Charcoal & Hearth',
    heritageLabel: 'Live Robata',
    branchTag: 'All Enclaves',
    pricePkr: 5400,
    servingNote: 'Accompanied by Saffron Paratha & Burnt Garlic Labneh',
    shortDescription:
      'Ribbon-thin tenderloin strips smoked with mustard oil alongside pistachio-crusted chicken thigh glazed in clotted cream.',
    provenance:
      'Balances the fiery mustard-smoke heritage of old Karachi street grills with delicate Mughlai cream marinades.',
    spiceProfile: 'Black mustard oil, wild poppy seed, white pepper, nutmeg',
    recommendedPairing: 'Smoked Black Cardamom & Dried Plum Elixir',
    allergens: 'Tree nuts (pistachio), Dairy, Gluten (paratha)',
    image: bihariFlight1,
    images: [bihariFlight1, bihariFlight2, bihariFlight3],
    imageAlt: 'Grilled Bihari and Malai Boti platter with naan and mint chutney on dark basalt slate',
  },
];

export const PRIVATE_SUITES: PrivateSuite[] = [
  {
    id: 'clifton-obsidian',
    name: 'Clifton Modern Booth Lounge',
    branchId: 'clifton',
    branchName: 'Clifton Block 4 Atelier',
    capacity: 'Up to 10 Guests',
    minimumSpendPkr: 145000,
    summary:
      'Contemporary fast-casual flagship seating with tufted black leather banquette booths, warm walnut high-top tables, and direct express counter service.',
    details: [
      'Reserved leather banquette booths and communal high-top seating for groups',
      'Direct order-counter express pickup and table-number runner service',
      'Custom zero-proof botanical and single-estate chai flight',
    ],
    image: modernBoothLoungeImg,
    imageAlt: 'Modern fast-food style seating lounge with tufted black leather booths, walnut high-top tables, and warm recessed lighting',
  },
  {
    id: 'dha-courtyard',
    name: 'DHA Phase 6 Flagship Dining Hall',
    branchId: 'dha',
    branchName: 'DHA Phase 6 Pavilion',
    capacity: 'Up to 16 Guests',
    minimumSpendPkr: 210000,
    summary:
      'Sleek urban dining hall featuring clean architectural linear lighting, padded leather booths, and fast-casual counter-to-table service.',
    details: [
      'Spacious booth & table clusters designed for effortless group dining',
      'Digital express order counter with dedicated table runner service',
      'Valet staging right outside the Bukhari flagship entrance',
    ],
    image: heroFastfoodSeatingImg,
    imageAlt: 'DHA Phase 6 modern fast-food style dining hall with leather banquette booths and contemporary order counter',
  },
];

export const CELLAR_PAIRINGS: CellarPairing[] = [
  {
    id: 'kashmiri-kahwa',
    name: 'Kashmiri Zafrani Kahwa Reserve',
    origin: 'First-flush green tea · Pampore saffron · Blanched Badam',
    notes: 'Steeped tableside in a blackened brass samovar with crushed green cardamom.',
    pricePkr: 1450,
  },
  {
    id: 'smoked-aloo-bukhara',
    name: 'Smoked Black Cardamom & Dried Plum Elixir',
    origin: 'Hunza sun-dried plum · Charred badi elaichi · Vetiver mist',
    notes: 'Deep tannic finish crafted specifically to cut through rich bone marrow nihari.',
    pricePkr: 1650,
  },
  {
    id: 'sindhi-rose-sherbet',
    name: 'Sindhi Rose & Saffron Sparkling Sherbet',
    origin: 'Damask rose distillate · Wild basil seed · Himalayan salt',
    notes: 'Chilled botanical palate cleanser served in hand-blown crystal flutes.',
    pricePkr: 1550,
  },
];
