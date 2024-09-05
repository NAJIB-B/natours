const Tour = require('../models/tourModels')
const catchAsync = require('../utils/catchAsync')



exports.getOverview =catchAsync(async (req, res, next) => {
  // 1 get tour data from collection
  const tours = await Tour.find();

  
  // 2 build templates
  // render template using tour data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  })
})

exports.getTour = catchAsync(async (req, res, next) => {
	const {slug} = req.params
	let query = Tour.findOne({slug})

	query = query.populate({path: 'reviews', fields: 'review rating user'})
	const tour = await query
	

  res.status(200).render('tour', {
    title: tour.name,
	tour
  })
})
