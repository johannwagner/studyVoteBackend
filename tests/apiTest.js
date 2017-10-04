const axios = require('axios');
const url = require('./settings');
const Tests = require('./testFramework');
const tests = new Tests();

//region - Init -

const session = {
    //TODO: randomize
    user: {
        displayName: 'Fred',
        email: '1frsed@feuerstein12.com',
        passwordHash: 'FredFeuerstein'
    }
}

const axiosInstance = axios.create({
    baseURL: url,
    timeout: 1000,
    headers: {'x-token': null}
});

function performTests()
{
    tests.start();

    createUser().then(() => {
        return loginUser();
    }).then(() => {
        return createSemester();
    }).then(() => {
        return createCourseInstance();
    }).then(() => {
        return createCourseInstanceGroup();
    }).then(() => {
        return createUserCourseInstance();
    }).then(() => {
        return createAdmissionRequirementItem();
    }).then(() => {
        return createUserProgress();
    }).then(() => {
        tests.finish();
    });
}

//endregion

//region - Create -

function createUser() {
    return axiosInstance.put('/user', session.user).then(function (response) {

        session.token = response.data.token;
        if(!session.token)
            throw 'Token Invalid';

        tests.passed('CREATE USER');
    }).catch(function (error) {
        tests.failed('CREATE USER', error);
    });
}

function loginUser() {
    return axiosInstance.post('/token', { userMail: session.user.email, userPasswordHash: session.user.passwordHash}).then(function (response) {

        session.token = response.data.token;
        if(!session.token)
            throw 'Token Invalid';

        axiosInstance.headers = {};
        axiosInstance.headers['x-token'] = session.token;

        tests.passed('LOGIN USER');
    }).catch(function (error) {
        tests.failed('LOGIN USER', error);
    });
}

function createSemester() {
    let data = {
        displayName: 'WS17/18',
        startDate: '2017-10-03 00:00:00.0',
        endDate: '2018-03-30 00:00:00.0'
    };

    return axiosInstance.put('/semester', data, { headers: axiosInstance.headers }).then(function (response) {

        session.semesterId = response.data.id;
        if(!session.semesterId)
            throw 'semesterId Invalid';

        tests.passed('CREATE SEMESTER');
    }).catch(function (error) {
        tests.failed('CREATE SEMESTER', error);
    });
}

function createCourseInstance() {
    let data = {
        semesterId : session.semesterId,
        shortName: 'BV',
        displayName: 'Bildverarbeitung'
    };

    return axiosInstance.put('/courseInstance', data, { headers: axiosInstance.headers }).then(function (response) {

        session.courseInstanceId = response.data.id;
        if(!session.courseInstanceId)
            throw 'courseInstanceId Invalid';

        tests.passed('CREATE COURSE INSTANCE');
    }).catch(function (error) {
        tests.failed('CREATE COURSE INSTANCE', error);
    });
}

function createCourseInstanceGroup() {
    let data = {
        semesterId : session.semesterId,
        room: '333',
        startTime: '1970-01-01 15:00:00.0',
        endTime: '1970-01-01 17:00:00.0'
    };

    return axiosInstance.put('/courseInstance/' + session.courseInstanceId + '/group', data, { headers: axiosInstance.headers }).then(function (response) {

        session.courseInstanceGroupId = response.data.id;
        if(!session.courseInstanceGroupId)
            throw 'courseInstanceGroupId Invalid';

        tests.passed('CREATE COURSE INSTANCE GROUP');
    }).catch(function (error) {
        tests.failed('CREATE COURSE INSTANCE GROUP', error);
    });
}

function createUserCourseInstance() {
    let data = {
        semesterId : session.semesterId,
        courseInstanceId: session.courseInstanceId
    };

    return axiosInstance.put('/userCourseInstance', data, { headers: axiosInstance.headers }).then(function (response) {

        session.userCourseInstanceId = response.data.id;
        if(!session.userCourseInstanceId)
            throw 'userCourseInstanceId Invalid';

        tests.passed('CREATE USER COURSE INSTANCE');
    }).catch(function (error) {
        tests.failed('CREATE USER COURSE INSTANCE', error);
    });
}

function createAdmissionRequirementItem() {
    let data = {
        courseInstanceId: session.courseInstanceId,
        admissionRequirementType: 0,
        expireDate: '2018-03-30 00:00:00.0',
        maxTasks: 56,
        minPercentage: 0.66,
        mandatory: true
    };

    return axiosInstance.put('/admissionRequirement/item', data, { headers: axiosInstance.headers }).then(function (response) {

        session.admissionRequirementItemId = response.data.id;
        if(!session.admissionRequirementItemId)
            throw 'admissionRequirementItemId Invalid';

        session.admissionRequirementId = response.data.admissionRequirementId;
        if(!session.admissionRequirementId)
            throw 'admissionRequirementId Invalid';

        tests.passed('CREATE ADMISSION REQUIREMENT ITEM');
    }).catch(function (error) {
        tests.failed('CREATE ADMISSION REQUIREMENT ITEM', error);
    });
}

function createUserProgress() {
    let data = {
        admissionRequirementItemId: session.admissionRequirementItemId,
        taskCount: 4,
        maxCount: 6,
        semesterWeek: 1
    };

    return axiosInstance.put('/userProgress', data, { headers: axiosInstance.headers }).then(function (response) {

        session.userProgressId = response.data.id;
        if(!session.userProgressId)
            throw 'userProgressId Invalid';

        tests.passed('CREATE USER PROGRESS');
    }).catch(function (error) {
        tests.failed('CREATE USER PROGRESS', error);
    });
}

//endregion

//region - Get -

//endregion

performTests();