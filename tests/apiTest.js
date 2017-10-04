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
        return getUserProgress();
    }).then(() => {
        return getCourseInstance();
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

        tests.passed('Create user');
    }).catch(function (error) {
        tests.failed('Create user', error);
    });
}

function loginUser() {
    return axiosInstance.post('/token', { userMail: session.user.email, userPasswordHash: session.user.passwordHash}).then(function (response) {

        session.token = response.data.token;
        if(!session.token)
            throw 'Token Invalid';

        axiosInstance.headers = {};
        axiosInstance.headers['x-token'] = session.token;

        tests.passed('Login user');
    }).catch(function (error) {
        tests.failed('Login user', error);
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

        tests.passed('Create semester');
    }).catch(function (error) {
        tests.failed('Create semester', error);
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

        tests.passed('Create courseInstance');
    }).catch(function (error) {
        tests.failed('Create courseInstance', error);
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

        tests.passed('Create courseInstanceGroup');
    }).catch(function (error) {
        tests.failed('Create courseInstanceGroup', error);
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

        tests.passed('Create userCourseInstance');
    }).catch(function (error) {
        tests.failed('Create userCourseInstance', error);
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

        tests.passed('Create admissionRequirementItem');
    }).catch(function (error) {
        tests.failed('Create admissionRequirementItem', error);
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

        tests.passed('Create userProgress');
    }).catch(function (error) {
        tests.failed('Create userProgress', error);
    });
}

//endregion

//region - Get -

function getCourseInstanceGroup()
{
    return axiosInstance.get('/courseInstance/' + session.courseInstanceId + 'group/' + session.courseInstanceGroupId, { headers: axiosInstance.headers }).then(function (response) {

        if(!response.data || response.data.length != 1 || response.data[0].id !== session.courseInstanceGroupId)
            throw 'courseInstanceGroup Invalid';

        session.courseInstanceGroup = response.data[0];
        tests.passed('Get courseInstanceGroup');
    }).catch(function (error) {
        tests.failed('Get courseInstanceGroup', error);
    });
}

function getCourseInstance()
{
    return axiosInstance.get('/courseInstance/' + session.courseInstanceId, { headers: axiosInstance.headers }).then(function (response) {

        if(!response.data || response.data.length != 1 || response.data[0].id !== session.courseInstanceId)
            throw 'courseInstance Invalid';

        session.courseInstance = response.data[0];
        tests.passed('Get courseInstance');
    }).catch(function (error) {
        tests.failed('Get courseInstance', error);
    });
}

function getAdmissionRequirement()
{
    return axiosInstance.get('/admissionRequirement/' + session.admissionRequirementId, { headers: axiosInstance.headers }).then(function (response) {

        if(!response.data || response.data.length != 1 || response.data[0].id !== session.courseInstanceId)
            throw 'courseInstance Invalid';

        session.courseInstance = response.data[0];
        tests.passed('Get courseInstance');
    }).catch(function (error) {
        tests.failed('Get courseInstance', error);
    });
}

function getUserProgress()
{
    return axiosInstance.get('/userProgress?semesterId=' + session.semesterId, { headers: axiosInstance.headers }).then(function (response) {

        //session.userProgressId2 = response.data;
        if(!response.data || response.data.length != 1)
            throw 'userProgress Invalid';

        session.userProgress = response.data[0];
        tests.passed('Get userProgress');
    }).catch(function (error) {
        tests.failed('Get userProgress', error);
    });
}



//endregion

performTests();