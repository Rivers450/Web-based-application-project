const { Model } = require('mongoose');
const { events } = require('../models/eventModel');
const model = require('../models/eventModel');


function findByCategory(model, category) {
    return model.filter((event) => event.category === category);
};

exports.index = (req, res, next) => {
    model.find()
        .then((events) =>
            res.render('./event/index', {
                events,
                Homework: findByCategory(events, "Homework"),
                Work: findByCategory(events, "Work"),
                Clubs: findByCategory(events, "Clubs"),
                Outings: findByCategory(events, "Outings"),
                Other: findByCategory(events, "Other")
            })
        )
        .catch(err => next(err))
};

exports.new = (req, res) => {
    res.render('./event/new');
};

exports.create = (req, res, next) => {
    let event = req.body;
    event.host = req.session.user;
    event.image = "images/" + req.file.filename;
    let image = req.file.filename;
    let eventModel = new model(event);

    eventModel.save()
        .then(event => res.redirect('/events/' + event.id))
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
            }
            next(err);
        });
};


exports.show = (req, res, next) => {
    let id = req.params.id;

    model.findById(id).populate('host')
        .then(event => {
            if (event) {
                res.render('./event/show', { event });
            } else {
                let err = new Error('Cannot find a event with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.edit = (req, res, next) => {

    let id = req.params.id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid Event id');
        err.status = 400;
        return next(err);
    }
    model.findById(id)
        .then(event => {
            if (event) {
                return res.render('./event/edit', { event });
            } else {
                let err = new Error('Cannot find a event with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};


exports.update = (req, res, next) => {
    let event = req.body;
    let id = req.params.id;

    event.image = "images/" + req.file.filename;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid Event id');
        err.status = 400;
        return next(err);
    }
    model.findByIdAndUpdate(id, event, { useFindAndModify: false, runValidators: true })
        .then(event => {
            if (event) {
                res.redirect('/events/' + id);
            } else {
                let err = new Error('Cannot find a event with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                err.status = 400;
                next(err);
            }
        });
}

exports.delete = (req, res, next) => {
    let id = req.params.id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid Event id');
        err.status = 400;
        return next(err);
    }
    model.findByIdAndDelete(id, { useFindAndModify: false })
        .then(event => {
            if (event) {
                res.redirect('/events');
            } else {
                let err = new Error('Cannot find a event with id ' + id);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
};