export const AREA_SERVED_CITIES = [
  'Caen',
  'Rots',
  'Authie',
  'Ifs',
  'Hérouville-Saint-Clair',
  'Mondeville',
  'Colombelles',
  'Carpiquet',
  'Cormelles-le-Royal',
  'Fleury-sur-Orne',
  'Louvigny',
  'Bretteville-sur-Odon',
  'Épron',
  'Giberville',
  'Démouville',
  'Blainville-sur-Orne',
  'Ouistreham',
  'Bénouville',
  'Biéville-Beuville',
  'Saint-Contest',
  'Mathieu',
  'Saint-Germain-la-Blanche-Herbe',
  'Deauville'
] as const;

export type LocalCityPage = {
  slug: string;
  name: string;
  accessHint: string;
  parkingHint: string;
  nearbySpots: string;
};

export const LOCAL_CITY_PAGES = [
  {
    slug: 'rots',
    name: 'Rots',
    accessHint: 'Intervention possible en debut de matinee ou fin de journee pour limiter les temps de trajet.',
    parkingHint: 'Un stationnement en allee ou sur parking residentiel facilite la prestation sur place.',
    nearbySpots: 'Rots, Authie, Carpiquet'
  },
  {
    slug: 'authie',
    name: 'Authie',
    accessHint: 'Les demandes de detailing interieur y sont frequentes sur vehicules familiaux.',
    parkingHint: 'Un emplacement stable et accessible est recommande pour securiser le materiel.',
    nearbySpots: 'Authie, Rots, Saint-Contest'
  },
  {
    slug: 'ifs',
    name: 'Ifs',
    accessHint: 'Des interventions sont regulierement planifiees sur les zones residentielles d Ifs.',
    parkingHint: 'La prestation est plus fluide avec un point d eau a proximite si disponible.',
    nearbySpots: 'Ifs, Fleury-sur-Orne, Cormelles-le-Royal'
  },
  {
    slug: 'herouville-saint-clair',
    name: 'Hérouville-Saint-Clair',
    accessHint: 'Nous adaptons les interventions aux contraintes de stationnement en secteur urbain dense.',
    parkingHint: 'Une place reservee au pied de la residence est ideale pour reduire les manipulations.',
    nearbySpots: 'Hérouville-Saint-Clair, Épron, Colombelles'
  },
  {
    slug: 'mondeville',
    name: 'Mondeville',
    accessHint: 'Mondeville est couverte en continu selon disponibilite hebdomadaire.',
    parkingHint: 'Un espace de travail degage autour du vehicule permet une meilleure qualite de finition.',
    nearbySpots: 'Mondeville, Giberville, Démouville'
  },
  {
    slug: 'colombelles',
    name: 'Colombelles',
    accessHint: 'Les prestations exterieures y sont souvent combinees avec un nettoyage interieur complet.',
    parkingHint: 'Un stationnement hors circulation est conseille pour un resultat optimal.',
    nearbySpots: 'Colombelles, Blainville-sur-Orne, Hérouville-Saint-Clair'
  },
  {
    slug: 'carpiquet',
    name: 'Carpiquet',
    accessHint: 'Les interventions sont planifiees avec souplesse sur Carpiquet et sa zone proche.',
    parkingHint: 'Une cour ou une place privee simplifie la preparation et le detailing exterieur.',
    nearbySpots: 'Carpiquet, Rots, Bretteville-sur-Odon'
  },
  {
    slug: 'cormelles-le-royal',
    name: 'Cormelles-le-Royal',
    accessHint: 'Les demandes de remise a niveau interieur sont frequentes sur ce secteur.',
    parkingHint: 'Prevoir un acces simple au vehicule reduit le temps d installation.',
    nearbySpots: 'Cormelles-le-Royal, Ifs, Mondeville'
  },
  {
    slug: 'fleury-sur-orne',
    name: 'Fleury-sur-Orne',
    accessHint: 'Interventions disponibles en semaine et certains creneaux du samedi.',
    parkingHint: 'Un emplacement plat et bien eclaire est prefere pour les controles de finition.',
    nearbySpots: 'Fleury-sur-Orne, Ifs, Louvigny'
  },
  {
    slug: 'louvigny',
    name: 'Louvigny',
    accessHint: 'Louvigny est incluse dans les tournees locales autour de Caen.',
    parkingHint: 'Un stationnement proche de l habitation accelere le demarrage de la prestation.',
    nearbySpots: 'Louvigny, Fleury-sur-Orne, Bretteville-sur-Odon'
  },
  {
    slug: 'bretteville-sur-odon',
    name: 'Bretteville-sur-Odon',
    accessHint: 'Le secteur est adapte aux prestations completes interieur + exterieur.',
    parkingHint: 'La disponibilite d un espace lateral autour du vehicule est un vrai plus.',
    nearbySpots: 'Bretteville-sur-Odon, Louvigny, Carpiquet'
  },
  {
    slug: 'epron',
    name: 'Épron',
    accessHint: 'Les demandes d entretien regulier y sont souvent programmees en demi-journee.',
    parkingHint: 'Un emplacement calme facilite le travail de precision sur l habitacle.',
    nearbySpots: 'Épron, Hérouville-Saint-Clair, Saint-Contest'
  },
  {
    slug: 'giberville',
    name: 'Giberville',
    accessHint: 'Giberville est couverte pour detailing interieur, polissage et packs premium.',
    parkingHint: 'Une place disponible a l avance permet de tenir les delais annonces.',
    nearbySpots: 'Giberville, Mondeville, Démouville'
  },
  {
    slug: 'demouville',
    name: 'Démouville',
    accessHint: 'Le secteur est pris en charge avec des tournes planifiees sur la semaine.',
    parkingHint: 'Un acces direct au vehicule est recommande pour optimiser la prestation.',
    nearbySpots: 'Démouville, Giberville, Mondeville'
  },
  {
    slug: 'blainville-sur-orne',
    name: 'Blainville-sur-Orne',
    accessHint: 'Blainville-sur-Orne est bien desservie pour les interventions a domicile.',
    parkingHint: 'Un emplacement en exterieur prive limite les interruptions pendant le detailing.',
    nearbySpots: 'Blainville-sur-Orne, Colombelles, Bénouville'
  },
  {
    slug: 'ouistreham',
    name: 'Ouistreham',
    accessHint: 'Le secteur littoral est couvert selon meteo et disponibilites horaires.',
    parkingHint: 'En zone ventee, un emplacement abrite ameliore la qualite finale.',
    nearbySpots: 'Ouistreham, Bénouville, Blainville-sur-Orne'
  },
  {
    slug: 'benouville',
    name: 'Bénouville',
    accessHint: 'Bénouville est integree aux interventions locales entre Caen et le littoral.',
    parkingHint: 'Une cour ou un parking residentiel est ideal pour maintenir un rythme stable.',
    nearbySpots: 'Bénouville, Ouistreham, Blainville-sur-Orne'
  },
  {
    slug: 'bieville-beuville',
    name: 'Biéville-Beuville',
    accessHint: 'Les prestations premium y sont souvent reservees sur rendez-vous anticipe.',
    parkingHint: 'Un stationnement disponible des votre arrivee evite les temps morts.',
    nearbySpots: 'Biéville-Beuville, Mathieu, Hérouville-Saint-Clair'
  },
  {
    slug: 'saint-contest',
    name: 'Saint-Contest',
    accessHint: 'Le secteur est couvert pour detailing ponctuel et entretien regulier.',
    parkingHint: 'Un emplacement proche du domicile facilite les interventions longues.',
    nearbySpots: 'Saint-Contest, Authie, Épron'
  },
  {
    slug: 'mathieu',
    name: 'Mathieu',
    accessHint: 'Mathieu est prise en charge dans les tournees de detailing autour de Caen.',
    parkingHint: 'Un point de stationnement stable est utile pour les packs complets.',
    nearbySpots: 'Mathieu, Biéville-Beuville, Saint-Contest'
  },
  {
    slug: 'saint-germain-la-blanche-herbe',
    name: 'Saint-Germain-la-Blanche-Herbe',
    accessHint: 'Interventions possibles avec delai court selon charge planning.',
    parkingHint: 'Un stationnement facile d acces permet de gagner du temps sur la mise en place.',
    nearbySpots: 'Saint-Germain-la-Blanche-Herbe, Authie, Caen'
  }
] as const satisfies readonly LocalCityPage[];
