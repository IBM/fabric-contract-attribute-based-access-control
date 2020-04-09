# Generic Supply Chain Test Scenario

 - create_identities.sh - Register identities used in the Generic Supply Chain demo:
    ```
    $ chmod +x create_identities.sh
    $ ./create_identities.sh
    ```
 - enroll_identities.sh - Enroll identities into wallet used in the Generic Supply Chain demo:
    ```
    $ chmod +x enroll_identities.sh
    $ ./enroll_identities.sh
    ```
 - error_testcase.sh - Run through a sample scenario using curl commands to test error conditions 
    ```
    $ chmod +x error_testcase.sh
    $ ./error_testcase.sh
    ```
 - testcase.sh - Run through a sample scenario using curl commands to create Orders and move an Order through the process.
    ```
    $ chmod +x testcase.sh
    $ ./testcase.sh
    ```
