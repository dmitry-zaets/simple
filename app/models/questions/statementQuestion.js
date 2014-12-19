﻿define(['models/questions/question', 'models/answers/statementAnswer', 'guard', 'eventManager', 'eventDataBuilders/questionEventDataBuilder'],
    function (Question, StatementAnswer, guard, eventManager, questionEventDataBuilder) {
        "use strict";

        function StatementQuestion(spec) {
            var _protected = {
                getProgress: getProgress,
                restoreProgress: restoreProgress,

                submit: submitAnswer
            };

            Question.call(this, spec, _protected);

            this.statements = _.map(spec.statements, function (statement) {
                return new StatementAnswer({
                    id: statement.id,
                    text: statement.text,
                    isCorrect: statement.isCorrect
                });
            });
        }

        return StatementQuestion;

        function submitAnswer(userAnswers) {
            guard.throwIfNotArray(userAnswers, 'userAnswers is not an array');

            _.each(this.statements, function (statement) {
                var userAnswer = _.find(userAnswers, function (answer) { return answer.id == statement.id; });
                statement.userAnswer = !_.isNullOrUndefined(userAnswer) ? userAnswer.answer : null;
            });

            this.score(calculateScore.call(this));
            this.isAnswered = true;
            this.isCorrectAnswered = this.score() == 100;

            var eventData = questionEventDataBuilder.buildStatementQuestionSubmittedEventData(this);
            eventManager.answersSubmitted(eventData);
        }

        function calculateScore() {
            return _.every(this.statements, function (statement) {
                return statement.userAnswer == statement.isCorrect;
            }) ? 100 : 0;
        }

        function getProgress() {
            if (this.isCorrectAnswered) {
                return 100;
            } else {
                return _.chain(this.statements)
                    .filter(function (statement) {
                        return _.isBoolean(statement.userAnswer);
                    })
                    .reduce(function (obj, ctx) {
                        obj[ctx.id] = ctx.userAnswer;
                        return obj;
                    }, {})
                    .value();

            }
        }

        function restoreProgress(progress) {
            _.chain(this.statements)
                .each(function (statement) {
                    statement.userAnswer = progress === 100 ? statement.isCorrect : progress[statement.id];
                });
            this.score(calculateScore.call(this));
        }

    });