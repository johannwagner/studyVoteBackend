const axios = require('axios');
const url = require('./settings');
const Tests = require('./testFramework');
const tests = new Tests();

//region - Init -

const session = {
    //TODO: randomize
    user: {
        displayName: 'Fred',
        userMail: Math.random() + '@feuerstein12.com',
        userPasswordHash: 'FredFeuerstein'
    },
    admissionRequirementItemIds: []
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
        return createAdmissionRequirementItem(0);
    }).then(() => {
        return createAdmissionRequirementItem(1);
    }).then(() => {
        return createUserProgress(0,3,5,0);
    }).then(() => {
        return createUserProgress(1,2,4,1);
    }).then(() => {
        return createUserProgress(2,5,7,1);
    }).then(() => {
        return createUserProgress(2,5,7,0);
    }).then(() => {
        return createUserProgress(3,5,7,1);
    }).then(() => {
        return createUserProgress(3,5,7,0);
    }).then(() => {
        return createUserProgress(4,2,7,0);
    }).then(() => {
        return getUserProgress();
    }).then(() => {
        return getCourseInstance();
    }).then(() => {
        return getCourseInstanceGroup();
    }).then(() => {
        return getUserCourseInstance();
    }).then(() => {
        return getAdmissionRequirement();
    }).then(() => {
        return getAdmissionRequirementItem();
    }).then(() => {
        return getSemesterById();
    }).then(() => {
        return getSemesterByCurrentDate();
    }).then(() => {
        return changeAdmissionRequirementItem();
    }).then(() => {
        return changeCourseInstance();
    }).then(() => {
        return changeCourseInstanceGroup();
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
    return axiosInstance.post('/token', { userMail: session.user.userMail, userPasswordHash: session.user.userPasswordHash}).then(function (response) {

        session.token = response.data.token;
        if(!session.token)
            throw 'Token Invalid';

        axiosInstance.headers = {};
        axiosInstance.headers['x-token'] = session.token;

        console.log(response.data);

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
        displayName: 'Bildverarbeitung',
        docent: 'Prof xy',
        room: '334'
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
        docent: 'Gunter Saake',
        startTime: {
            hours: 15,
            minutes: 15
        },
        endTime: {
            hours: 16,
            minutes: 45
        },
        weekDay: 2
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

function createAdmissionRequirementItem(type) {
    let data = {
        courseInstanceId: session.courseInstanceId,
        admissionRequirementType: type,
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
        session.admissionRequirementItemIds.push(response.data.id);
        if(!session.admissionRequirementId)
            throw 'admissionRequirementId Invalid';

        tests.passed('Create admissionRequirementItem');
    }).catch(function (error) {
        tests.failed('Create admissionRequirementItem', error);
    });
}

function createUserProgress(week, taskcount, maxcount, arItemId) {
    let data = {
        admissionRequirementItemId: session.admissionRequirementItemIds[arItemId],
        taskCount: taskcount,
        maxCount: maxcount,
        semesterWeek: week
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
    return axiosInstance.get('/courseInstance/' + session.courseInstanceId + '/group/' + session.courseInstanceGroupId, { headers: axiosInstance.headers }).then(function (response) {

        if(!response.data || response.data.length !== 1 || response.data[0].id !== session.courseInstanceGroupId)
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

        if(!response.data || response.data.id !== session.courseInstanceId)
            throw 'courseInstance Invalid';

        session.courseInstance = response.data;
        tests.passed('Get courseInstance');
    }).catch(function (error) {
        tests.failed('Get courseInstance', error);
    });
}

function getUserCourseInstance()
{
    return axiosInstance.get('/userCourseInstance/', { headers: axiosInstance.headers }).then(function (response) {

        if(!response.data || response.data.length !== 1 || response.data[0].id !== session.userCourseInstanceId)
            throw 'userCourseInstanceId Invalid';

        session.userCourseInstance = response.data[0];
        tests.passed('Get userCourseInstance');
    }).catch(function (error) {
        tests.failed('Get userCourseInstance', error);
    });
}

function getAdmissionRequirement()
{
    return axiosInstance.get('/admissionRequirement/' + session.admissionRequirementId, { headers: axiosInstance.headers }).then(function (response) {

        console.log(response.data);
        if(!response.data || response.data.length !== 1 || response.data[0].id !== session.admissionRequirementId)
            throw 'admissionRequirement Invalid';

        //if(!response.data[0].admissionRequirementItems || response.data[0].admissionRequirementItems.length !== 1 || session.admissionRequirementItemId !== response.data[0].admissionRequirementItems[0].id)
        //   throw 'admissionRequirementItem Invalid';

        session.courseInstance = response.data[0];
        tests.passed('Get admissionRequirement');
    }).catch(function (error) {
        tests.failed('Get admissionRequirement', error);
    });
}

function getAdmissionRequirementItem()
{
    return axiosInstance.get('/admissionRequirement/' + session.admissionRequirementId + '/item/' + session.admissionRequirementItemId, { headers: axiosInstance.headers }).then(function (response) {

        if(!response.data || response.data.length !== 1 || response.data[0].id !== session.admissionRequirementItemId)
            throw 'admissionRequirementItem Invalid';

        session.courseInstance = response.data[0];
        tests.passed('Get admissionRequirementItem');
    }).catch(function (error) {
        tests.failed('Get admissionRequirementItem', error);
    });
}

function getUserProgress()
{
    return axiosInstance.get('/userProgress?semesterId=' + session.semesterId, { headers: axiosInstance.headers }).then(function (response) {

        //session.userProgressId2 = response.data;
        if(!response.data || response.data.length !== 1)
            throw 'userProgress Invalid';

        session.userProgress = response.data[0];
        tests.passed('Get userProgress');
    }).catch(function (error) {
        tests.failed('Get userProgress', error);
    });
}

function getSemesterById()
{
    return axiosInstance.get('/semester/' + session.semesterId, { headers: axiosInstance.headers }).then(function (response) {

        //session.userProgressId2 = response.data;
        if(!response.data || response.data.length !== 1 || response.data[0].id !== session.semesterId)
            throw 'semester Invalid';

        session.userProgress = response.data[0];
        tests.passed('Get semester by id');
    }).catch(function (error) {
        tests.failed('Get semester by id', error);
    });
}

function getSemesterByCurrentDate()
{
    let currentDate = '2017-12-24 00:00:00.0'; //TODO: Fix currentDate
    return axiosInstance.get('/semester?currentDate=' + currentDate, { headers: axiosInstance.headers }).then(function (response) {

        if(!response.data || response.data.length < 1)
            throw 'semester Invalid';

        tests.passed('Get semester by currentDate');
    }).catch(function (error) {
        tests.failed('Get semester by currentDate', error);
    });
}

//endregion

//region - Change -

function changeAdmissionRequirementItem()
{
    let data = {
        admissionRequirementType: 1,
        expireDate: '2018-03-30 00:00:00.0',
        maxTasks: 56,
        minPercentage: 0.66,
        mandatory: false
    };

    return axiosInstance.post('/admissionRequirement/item/' + session.admissionRequirementItemId, data, { headers: axiosInstance.headers }).then(function (response) {

        if(!response.data.changedRows)
            throw 'No rows updated';

        tests.passed('Update admissionRequirementItem');
    }).catch(function (error) {
        tests.failed('Update admissionRequirementItem', error);
    });
}

function changeCourseInstance()
{
    let data = {
        docent: 'Turowski',
        room: '207'
    };

    return axiosInstance.post('/courseInstance/' + session.courseInstanceId, data, { headers: axiosInstance.headers }).then(function (response) {

        if(!response.data.changedRows)
            throw 'No rows updated';

        tests.passed('Update courseInstance');
    }).catch(function (error) {
        tests.failed('Update courseInstance', error);
    });
}

function changeCourseInstanceGroup()
{
    let data = {
        room: '334',
        startTime: {
            hours: 14,
            minutes: 15
        },
        endTime: {
            hours: 17,
            minutes: 45
        },
        weekDay: 3
    };

    return axiosInstance.post('/courseInstance/' + session.courseInstanceId + '/group/' + session.courseInstanceGroupId, data, { headers: axiosInstance.headers }).then(function (response) {

        if(!response.data.changedRows)
            throw 'No rows updated';

        tests.passed('Update courseInstanceGroup');
    }).catch(function (error) {
        tests.failed('Update courseInstanceGroup', error);
    });
}

//endregion

//region - Delete -


//endregion

performTests();