
class Tests
{
    constructor()
    {
        this.passedCount = 0;
        this.failedCount = 0;
    }

    count()
    {
        return this.passedCount + this.failedCount;
    }

    passed(name)
    {
        this.passedCount++;
        console.log('Test #' + this.count() + ' ' + name + ': passed');
    }

    failed(name, error)
    {
        this.failedCount++;
        console.log('Test #' + this.count() + ' ' + name + ': failed with error ' + error);
    }

    start()
    {
        console.log('Start Tests...');
    }

    finish()
    {
        console.log('Passed ' + this.passedCount + ' from ' + this.count() + ' Tests');
        if(this.failedCount === 0)
        {
            console.log('Result: Success! Passed all tests');
        }
        else
        {
            console.log('Result: Failed! ');
        }

    }
}

module.exports = Tests;