﻿define(['context', 'repositories/courseRepository', 'plugins/router', 'windowOperations', 'templateSettings'],
    function (context, repository, router, windowOperations, templateSettings) {

        var
            objectives = [],
            score = 0,
            masteryScore = 0,
            courseTitle = "\"" + context.course.title + "\"",

            statuses = {
                readyToFinish: 'readyToFinish',
                sendingRequests: 'sendingRequests',
                finished: 'finished'
            },
            status = ko.observable(statuses.readyToFinish),

            activate = function () {
                var course = repository.get();
                if (course == null) {
                    router.navigate('404');
                    return;
                }

                this.score = course.score();
                this.masteryScore = templateSettings.masteryScore.score;
                this.objectives = _.map(course.objectives, function (item) {

                    return {
                        id: item.id,
                        title: item.title,
                        imageUrl: item.imageUrl,
                        score: item.score(),
                        questions: item.questions,
                        affectProgress: item.affectProgress,
                        goToFirstQuestion: function() {
                            router.navigate('#/objective/' + item.id + '/question/' + item.questions[0].id);
                        }
                    };
                });
            },

            finish = function () {
                if (status() != statuses.readyToFinish) {
                    return;
                }
                status(statuses.sendingRequests);
                var course = repository.get();
                course.finish(onCourseFinishedCallback);
            },

            onCourseFinishedCallback = function () {
                status(statuses.finished);
                windowOperations.close();
            };

        return {
            activate: activate,
            caption: 'Objectives and questions',
            courseTitle: courseTitle,
            finish: finish,

            score: score,
            masteryScore: masteryScore,
            objectives: objectives,
            status: status,
            statuses: statuses
        };
    }
);