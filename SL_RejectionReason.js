/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/ui/serverWidget', 'N/redirect'],

    (record, serverWidget, redirect) => {
        function onRequest(scriptContext) {
            if (scriptContext.request.method === 'GET') {
                try {
                    var billId1 = scriptContext.request.parameters.custpage_billid;
                    var status = scriptContext.request.parameters.custpage_approve;
                    log.debug('GET bill id is ', billId1)
                    log.debug('status is ', status)

                    var form_obj = serverWidget.createForm({
                        title: 'Enter Rejection Reason'
                    });

                    form_obj.addField({
                        id: 'custpage_rejection_reason',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Rejection Reason'
                    });

                    var soId = form_obj.addField({
                        id: 'custpage_soid',
                        type: serverWidget.FieldType.TEXT,
                        label: 'SO Internal ID'
                    })

                    soId.defaultValue = billId1

                    // log.debug('valud of SO id is ', )

                    // record.setValue({
                    //     fieldId: 'custpage_soid' ,
                    //     value: billId1
                    // })

                    soId.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                    });

                    form_obj.addSubmitButton({
                        label: 'Submit'
                    });

                    if (status == 'F') {
                        scriptContext.response.writePage(form_obj);
                    }
                    else {

                        log.debug('enter in else - 53')
                        log.debug('enter in else - billId1', billId1)

                        var idSubmitField = record.submitFields({
                            type: record.Type.SALES_ORDER,
                            id: billId1,
                            values: {
                                'custbody_custom_status': 1
                            }
                        });

                        log.debug('id of submit field: ', idSubmitField)

                        // var recordObj = record.load({
                        //     type: record.Type.SALES_ORDER,
                        //     id: billId1,
                        //     isDynamic: true
                        // });


                        // recordObj.setValue({
                        //     fieldId: 'custbody_custom_status',
                        //     value: 1
                        // });

                        // recordObj.save();

                        // redirect.toRecord({
                        //     type: record.Type.SALES_ORDER,
                        //     id: billId1,
                        // });

                        scriptContext.response.write(
                            `<html><head><script>window.close()</script></head></html>`
                        );
                        log.debug("end of true");

                    }
                } catch (e) {
                    log.debug('error is ', e)
                }

            } else if (scriptContext.request.method === 'POST') {
                var rejectionReason = scriptContext.request.parameters.custpage_rejection_reason;
                var billIdX = scriptContext.request.parameters.custpage_soid;
                log.debug('POST bill id is ', billIdX)

                // Update the record with rejection reason
                try {
                    var recordObj = record.load({
                        type: record.Type.SALES_ORDER,
                        id: billIdX,
                        isDynamic: true
                    });
                } catch (e) {
                    log.debug('error while loading the record: ', e)
                }

                try {
                    recordObj.setValue({
                        fieldId: 'custbody1',
                        value: rejectionReason
                    });
                    recordObj.setValue({
                        fieldId: 'custbody_custom_status',
                        value: 2
                    });
                } catch (e) {
                    log.debug('error while setting rejection reason: ', e)
                }

                try {
                    recordObj.save(); // TypeError: Cannot read property 'save' of undefined [at Object.onRequest (/SuiteScripts/SL_RejectionReason.js:53:17)]

                } catch (e) {
                    log.debug('error while saving: ', e)
                }

                scriptContext.response.write('Rejection reason submitted successfully.');
            }
        }

        return {
            onRequest: onRequest
        };
    });