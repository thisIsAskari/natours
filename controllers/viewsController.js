exports.getOverview = (req, res) => {
  res.status(200).render('overview', {
    title: 'This is a overview page',
  });
};

exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'A Tour',
  });
};
