/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log', 'N/email', 'N/runtime'],
    /**
 * @param{record} record
 */
    (record, log, email, runtime) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            log.debug('before load triggered')
            var current_record = scriptContext.newRecord
            current_record.setValue({
                fieldId: 'custbody2',
                value: 3
            })
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {


        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            log.debug('after submit triggered')

            var recordObj = scriptContext.newRecord;
            //log.debug('Record object is ', recordObj)

            var billId = recordObj.id; //internal id of SO
            // try{
            //     var recordId = recordObj.save()
            //     log.debug('record id is ', recordId)
            // }catch(e){
            //     log.debug('record cant save ', e)
            // }

            try{    
                var saved_so_tranid = record.load({
                    type: record.Type.SALES_ORDER, 
                    id: billId,
                    isDynamic: true
                }).getValue ({fieldId: 'tranid'})
                log.debug('tran id is ', saved_so_tranid)

                // var customerName = saved_so_tranid.getValue({
                //     fieldId: 'entity'
                // })
                // log.debug('cust name in getValue', customerName)

                // var customerNamegetText = saved_so_tranid.getText({
                //     fieldId: 'entity'
                // })
                // log.debug('cust name in getText ', customerNamegetText)

            }catch(e){
                log.debug('error while loading ', e)
            }
        
            log.debug('bill id: ' + billId)

            if (billId) {
                var custName = recordObj.getValue({ fieldId: 'entity' }); // returns integer value
                var billAmount = recordObj.getValue({ fieldId: 'total' });
                // var tranNumber = recordObj.getValue({ fieldId: 'tranid' }); // 'to be generated'

                log.debug('vendor name: ' + custName + ' & Bill Amount: ' + billAmount + ' & Tran No: ' + saved_so_tranid)
                var currentUser = runtime.getCurrentUser().id
                var senderId = currentUser // Employee
                var recipientId = 803 // Accounting Manager

                var subject = "Vendor Bill id: " + saved_so_tranid + " needs your approval";
                var body = "The following vendor bill has been ";
                body += "Vendor Name: " + custName + "\n";
                body += "Bill Amount: " + billAmount + "\n";
                body += "Bill ID: " + billId + "\n";

                const htmlContent = `<!DOCTYPE html>
                <html>
                <head>
                    <title>Vendor Bill Approval</title>
                </head>
                <body>
                    <p>Hello '`+ custName + `',</p>
                    <p>A new vendor bill has been submitted and requires your approval.</p>
                    <p>Bill Details:</p>
                    <a href="https://td2969844.app.netsuite.com/app/site/hosting/scriptlet.nl?script=966&amp;deploy=1&custpage_billid=`+billId+`&custpage_approve=T" style="background-color: #4CAF50; /* Green */
                        border: none;
                        color: white;
                        padding: 15px 32px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        cursor: pointer;">Approve</a>
                    <a href="https://td2969844.app.netsuite.com/app/site/hosting/scriptlet.nl?script=966&amp;deploy=1&custpage_billid=`+billId+`" style="background-color:  #f44336; /* Red */
                        border: none;
                        color: white;
                        padding: 15px 32px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        <div id="rejectionReasonContainer"></div> <!-- Container for rejection reason textarea -->Reject</a>

                    <p>Thank you.</p>
                </body>
                </html>`;
                

                try {
                    log.debug('mail send init ')
                    email.send({
                        author: senderId,
                        recipients: recipientId, //803
                        subject: subject,
                        body: htmlContent
                    });
                    log.debug('mail sent')
                } catch (e) {
                    log.debug('error is ', e)
                }

            }
        }

        return { beforeLoad, beforeSubmit, afterSubmit }

    });