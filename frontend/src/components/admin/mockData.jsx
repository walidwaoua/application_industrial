export const kpis = [
  { id: 1, title: 'Commandes', value: 1280, delta: 12, icon: '🛒' },
  { id: 2, title: 'Utilisateurs', value: 845, delta: -3, icon: '👥' },
  { id: 3, title: 'Taux Conversion', value: '4.7%', delta: 1.2, icon: '⚡' },
  { id: 4, title: 'Revenu (K€)', value: 92, delta: 8.4, icon: '💶' },
  { id: 5, title: 'Tickets', value: 37, delta: -6, icon: '🎫' }
];

export const activities = Array.from({ length: 15 }).map((_, i) => ({
  id: i + 1,
  type: ['info','warn','success'][i % 3],
  message: ['Mise à jour config', 'Nouvel utilisateur créé', 'Synchronisation terminée'][i % 3],
  time: (10 - (i % 10)) + ' min'
}));

export const usersMock = Array.from({ length: 24 }).map((_, i) => {
  const roles = ['admin','manager','editor','viewer'];
  return {
    id: i + 1,
    name: 'User' + (i + 1),
    email: 'user' + (i + 1) + '@example.com',
    role: roles[i % roles.length],
    active: i % 5 !== 0
  };
});