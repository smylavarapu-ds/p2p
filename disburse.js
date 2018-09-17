/**
 * Create Transaction
 * @param {networkchain.Disbursal} Data
 * @transaction
 */


async function disbursal(Data){
  
  const factory = getFactory();
  
  const ns = 'networkchain';
  
  transRegistry = await getAssetRegistry(ns + '.BorrowerTransactionHistory')
  lendRegistry = await getAssetRegistry(ns + '.lenderExposure')
  
  try{
    
    const transInfo = await transRegistry.get(Data.panCardNumber);
    if (transInfo.liveLoans.includes(Data.loanId) === false){
        transInfo.disbursalDate.push(Data.disbursalDate);
        transInfo.liveLoans.push(Data.loanId);
        transInfo.liveLoanAmount.push(Data.loanAmount);
        transInfo.liveLoanOrganization.push(Data.organizationName);
        transInfo.loanStartDate.push(Data.loanStartDate);
        transInfo.loanEndDate.push(Data.loanEndDate);
        transInfo.productType.push(Data.productType);
        transInfo.repaymentMode.push(Data.repaymentMode);
        transInfo.clearanceMode.push(Data.clearanceMode);
        transInfo.emiFrequency.push(Data.emiFrequency);
        transInfo.insured.push(Data.insured);
        if (Data.repaymentMode === "Bullet"){
          transInfo.noOfEmiPerLoan.push(1);
        }
        else{
          transInfo.noOfEmiPerLoan.push(Data.noOfEmi);
        }   
        if (transInfo.lenderPanCardNumber.includes(Data.lenderPanCardNumber) === false){
          transInfo.lenderPanCardNumber.push(Data.lenderPanCardNumber);
          transInfo.lenderAmount.push(Data.lenderShare);
          }
        else{
            indOfLender = transInfo.lenderPanCardNumber.indexOf(Data.lenderPanCardNumber);
            transInfo.lenderAmount[indOfLender] = transInfo.lenderAmount[indOfLender]+Data.lenderShare
            
            // borrower to lender limit event greater than 50000
            if (transInfo.lenderAmount[indOfLender] >= 50000){
              var btlEvent = factory.newEvent(ns,'lenderToBorrowerLimit');
              btlEvent.borrowerPanCardNumber = Data.panCardNumber;
              btlEvent.borrowerName = Data.firstName;
              btlEvent.lenderPanCardNumber = Data.lenderPanCardNumber;
              btlEvent.lenderName = Data.lenderName;
              btlEvent.totalAmount = transInfo.lenderAmount[indOfLender];
              emit(btlEvent);
            }
        
        
          }       
        transInfo.noOfEmiOutstandingPerLoan.push(Data.noOfEmi);
        if(transInfo.totalOrgsAssociated.includes(Data.organizationName) === false){
          transInfo.totalOrgsAssociated.push(Data.organizationName);
        }
        transInfo.totalAmountBorrowed = transInfo.totalAmountBorrowed + Data.loanAmount
        // borrower limit Event greater than 1000000
        if (transInfo.totalAmountBorrowed >= 1000000){
          var blEvent = factory.newEvent(ns, 'borrowerLimit');
          blEvent.borrowerPanCardNumber = Data.panCardNumber;
          blEvent.borrowerName = Data.firstName;
          blEvent.totalAmount = transInfo.totalAmountBorrowed;
          emit(blEvent);
        }
      // lender registry updation
      try{

        const lendInfo1 = await lendRegistry.get(Data.lenderPanCardNumber);
        if (lendInfo1.liveLoans.includes(Data.loanId) === false){
          lendInfo1.liveLoans.push(Data.loanId);
          lendInfo1.liveLoanAmount.push(Data.lenderShare);
          lendInfo1.liveLoanOrganization.push(Data.organizationName);
          lendInfo1.totalAmountLend = lendInfo1.totalAmountLend + Data.lenderShare;
          lendInfo1.totalAmountInRotation = lendInfo1.totalAmountInRotation + Data.lenderShare;
          if (lendInfo1.totalOrgsAssociated.includes(Data.organizationName) === false){
            lendInfo1.totalOrgsAssociated.push(Data.organizationName);
          }
          // lender limit greater than 1000000 
          if (lendInfo1.totalAmountInRotation >= 1000000){
            var llEvent = factory.newEvent(ns, 'lenderLimit');
            llEvent.lenderName = Data.lenderName;
            llEvent.lenderPanCardNumber = Data.lenderPanCardNumber;
            llEvent.totalAmount = lendInfo1.totalAmountInRotation;
            emit(llEvent);
          }

          await lendRegistry.update(lendInfo1);
      }
      }
        catch(err){
          const lendInfo1 = factory.newResource(ns, 'lenderExposure', Data.lenderPanCardNumber);
          lendInfo1.panCardNumber = Data.lenderPanCardNumber;
          lendInfo1.lenderName = Data.lenderName;
          lendInfo1.liveLoans = [];
          lendInfo1.liveLoanAmount = [];
          lendInfo1.liveLoanOrganization = [];
          lendInfo1.totalOrgsAssociated = [];
          lendInfo1.totalAmountLend  = 0;
          lendInfo1.totalAmountInRotation = 0;
          lendInfo1.liveLoans.push(Data.loanId);
          lendInfo1.liveLoanAmount.push(Data.lenderShare);
          lendInfo1.liveLoanOrganization.push(Data.organizationName);
          lendInfo1.totalAmountLend = lendInfo1.totalAmountLend + Data.lenderShare;
          lendInfo1.totalAmountInRotation = lendInfo1.totalAmountInRotation + Data.lenderShare;
          lendInfo1.totalOrgsAssociated.push(Data.organizationName);
          // lender limit greater than 1000000 
          if (lendInfo1.totalAmountInRotation >= 1000000){
            var llEvent = factory.newEvent(ns, 'lenderLimit');
            llEvent.lenderName = Data.lenderName;
            llEvent.lenderPanCardNumber = Data.lenderPanCardNumber;
            llEvent.totalAmount = lendInfo1.totalAmountInRotation;
            emit(llEvent);
          }
          await lendRegistry.add(lendInfo1);
  }

    }  

    else{

      if (transInfo.lenderPanCardNumber.includes(Data.lenderPanCardNumber) === false){
      transInfo.lenderPanCardNumber.push(Data.lenderPanCardNumber);
      transInfo.lenderAmount.push(Data.lenderShare);
      }
      else{
        indOfLend = transInfo.lenderPanCardNumber.indexOf(Data.lenderPanCardNumber);
        transInfo.lenderAmount[indOfLend] = transInfo.lenderAmount[indOfLend]+Data.lenderShare
      }
      try{

          const lendInfo1 = await lendRegistry.get(Data.lenderPanCardNumber);
          if (lendInfo1.liveLoans.includes(Data.loanId) === false){
            lendInfo1.liveLoans.push(Data.loanId);
            lendInfo1.liveLoanAmount.push(Data.lenderShare);
            lendInfo1.liveLoanOrganization.push(Data.organizationName);
            lendInfo1.totalAmountLend = lendInfo1.totalAmountLend + Data.lenderShare;
            lendInfo1.totalAmountInRotation = lendInfo1.totalAmountInRotation + Data.lenderShare;
            if (lendInfo1.totalOrgsAssociated.includes(Data.organizationName) === false){
              lendInfo1.totalOrgsAssociated.push(Data.organizationName);
            }
            // lender limit greater than 1000000 
            if (lendInfo1.totalAmountInRotation >= 1000000){
              var llEvent = factory.newEvent(ns, 'lenderLimit');
              llEvent.lenderName = Data.lenderName;
              llEvent.lenderPanCardNumber = Data.lenderPanCardNumber;
              llEvent.totalAmount = lendInfo1.totalAmountInRotation;
              emit(llEvent);
            }
            await lendRegistry.update(lendInfo1);
        }
        }
      catch(err){
        const lendInfo1 = factory.newResource(ns, 'lenderExposure', Data.lenderPanCardNumber);
        lendInfo1.panCardNumber = Data.lenderPanCardNumber;
        lendInfo1.lenderName = Data.lenderName;
        lendInfo1.liveLoans = [];
        lendInfo1.liveLoanAmount = [];
        lendInfo1.liveLoanOrganization = [];
        lendInfo1.totalOrgsAssociated = [];
        lendInfo1.totalAmountLend  = 0;
        lendInfo1.totalAmountInRotation = 0;
        lendInfo1.liveLoans.push(Data.loanId);
        lendInfo1.liveLoanAmount.push(Data.lenderShare);
        lendInfo1.liveLoanOrganization.push(Data.organizationName);
        lendInfo1.totalAmountLend = lendInfo1.totalAmountLend + Data.lenderShare;
        lendInfo1.totalAmountInRotation = lendInfo1.totalAmountInRotation + Data.lenderShare;
        lendInfo1.totalOrgsAssociated.push(Data.organizationName);
        // lender limit greater than 1000000 
        if (lendInfo1.totalAmountInRotation >= 1000000){
          var llEvent = factory.newEvent(ns, 'lenderLimit');
          llEvent.lenderName = Data.lenderName;
          llEvent.lenderPanCardNumber = Data.lenderPanCardNumber;
          llEvent.totalAmount = lendInfo1.totalAmountInRotation;
          emit(llEvent);
        }
        await lendRegistry.add(lendInfo1);
    }
      
    }


    await transRegistry.update(transInfo);
    
   
  }
  catch(err){
      var infoNew = factory.newResource(ns,'BorrowerInfo',Data.panCardNumber);
      infoRegistry = await getAssetRegistry(ns + '.BorrowerInfo');
      infoNew.firstName = Data.firstName;
      infoNew.middleName = Data.middleName;
      infoNew.lastName = Data.lastName;
      infoNew.dateOfBirth = Data.dateOfBirth;
      infoNew.aadhaarCardNumber = Data.aadhaarCardNumber;
      await infoRegistry.add(infoNew);
      
      const transInfoNew = getFactory().newResource(ns,'BorrowerTransactionHistory',Data.panCardNumber);
      transInfoNew.disbursalDate = [];
      transInfoNew.liveLoans = [];
      transInfoNew.liveLoanAmount = [];
      transInfoNew.liveLoanOrganization = [];
      transInfoNew.loanStartDate = [];
      transInfoNew.loanEndDate = [];
      transInfoNew.productType =[];
      transInfoNew.repaymentMode =[];        
      transInfoNew.emiFrequency = [];         
      transInfoNew.clearanceMode = []; 
      transInfoNew.insured = []; 
      transInfoNew.noOfEmiPerLoan = [];   
      transInfoNew.totalOrgsAssociated = [];
      transInfoNew.lenderPanCardNumber = [];
      transInfoNew.lenderAmount = [];
      transInfoNew.noOfEmiOutstandingPerLoan = [];
      transInfoNew.disbursalDate.push(Data.disbursalDate);
      transInfoNew.liveLoans.push(Data.loanId);
      transInfoNew.liveLoanAmount.push(Data.loanAmount);
      transInfoNew.liveLoanOrganization.push(Data.organizationName);
      transInfoNew.totalOrgsAssociated.push(Data.organizationName);
      transInfoNew.noOfEmiPerLoan.push(Data.noOfEmi);
      transInfoNew.clearanceMode.push(Data.clearanceMode);
      transInfoNew.insured.push(Data.insured);
      transInfoNew.productType.push(Data.productType);
      transInfoNew.repaymentMode.push(Data.repaymentMode);
      transInfoNew.loanStartDate.push(Data.loanStartDate);
      transInfoNew.loanEndDate.push(Data.loanEndDate);
      transInfoNew.emiFrequency.push(Data.emiFrequency) ;
      transInfoNew.lenderPanCardNumber.push(Data.lenderPanCardNumber);
      transInfoNew.lenderAmount.push(Data.lenderShare);
      transInfoNew.noOfEmiOutstandingPerLoan.push(Data.noOfEmi);
      transInfoNew.totalAmountBorrowed = Data.loanAmount;
      await transRegistry.add(transInfoNew);
      // borrower to lender limit event greater than 50000
      if (Data.lenderShare >= 50000){
        var btlEvent = factory.newEvent(ns,'lenderToBorrowerLimit');
        btlEvent.borrowerPanCardNumber = Data.panCardNumber;
        btlEvent.borrowerName = Data.firstName;
        btlEvent.lenderPanCardNumber = Data.lenderPanCardNumber;
        btlEvent.lenderName = Data.lenderName;
        btlEvent.totalAmount = Data.lenderShare;
        emit(btlEvent);
      }
      // borrower limit Event greater than 1000000
      if (transInfoNew.totalAmountBorrowed >= 1000000){
        var blEvent = factory.newEvent(ns, 'borrowerLimit');
        blEvent.borrowerPanCardNumber = Data.panCardNumber;
        blEvent.borrowerName = Data.firstName;
        blEvent.totalAmount = transInfoNew.totalAmountBorrowed;
        emit(blEvent);
      }

      // lender registry updation
      try{

        const lendInfo1 = await lendRegistry.get(Data.lenderPanCardNumber);
        if (lendInfo1.liveLoans.includes(Data.loanId) === false){
          lendInfo1.liveLoans.push(Data.loanId);
          lendInfo1.liveLoanAmount.push(Data.lenderShare);
          lendInfo1.liveLoanOrganization.push(Data.organizationName);
          lendInfo1.totalAmountLend = lendInfo1.totalAmountLend + Data.lenderShare;
          lendInfo1.totalAmountInRotation = lendInfo1.totalAmountInRotation + Data.lenderShare;
          if (lendInfo1.totalOrgsAssociated.includes(Data.organizationName) === false){
            lendInfo1.totalOrgsAssociated.push(Data.organizationName);
          }
          // lender limit greater than 1000000 
          if (lendInfo1.totalAmountInRotation >= 1000000){
            var llEvent = factory.newEvent(ns, 'lenderLimit');
            llEvent.lenderName = Data.lenderName;
            llEvent.lenderPanCardNumber = Data.lenderPanCardNumber;
            llEvent.totalAmount = lendInfo1.totalAmountInRotation;
            emit(llEvent);
          }
          await lendRegistry.update(lendInfo1);
      }
      }
      catch(err){
        const lendInfo1 = factory.newResource(ns, 'lenderExposure', Data.lenderPanCardNumber);
        lendInfo1.panCardNumber = Data.lenderPanCardNumber;
        lendInfo1.lenderName = Data.lenderName;
        lendInfo1.liveLoans = [];
        lendInfo1.liveLoanAmount = [];
        lendInfo1.liveLoanOrganization = [];
        lendInfo1.totalOrgsAssociated = [];
        lendInfo1.totalAmountLend  = 0;
        lendInfo1.totalAmountInRotation = 0;
        lendInfo1.liveLoans.push(Data.loanId);
        lendInfo1.liveLoanAmount.push(Data.lenderShare);
        lendInfo1.liveLoanOrganization.push(Data.organizationName);
        lendInfo1.totalAmountLend = lendInfo1.totalAmountLend + Data.lenderShare;
        lendInfo1.totalAmountInRotation = lendInfo1.totalAmountInRotation + Data.lenderShare;
        lendInfo1.totalOrgsAssociated.push(Data.organizationName);
        // lender limit greater than 1000000 
        if (lendInfo1.totalAmountInRotation >= 1000000){
          var llEvent = factory.newEvent(ns, 'lenderLimit');
          llEvent.lenderName = Data.lenderName;
          llEvent.lenderPanCardNumber = Data.lenderPanCardNumber;
          llEvent.totalAmount = lendInfo1.totalAmountInRotation;
          emit(llEvent);
        }
        await lendRegistry.add(lendInfo1);
  }     
    

} 
} 
