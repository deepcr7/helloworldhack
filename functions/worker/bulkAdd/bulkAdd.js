const Organisation = require('../../../models/Organisation');
// const Worker = require("../../../models/Worker");
const addMultipleWorkers = require('../addMultipleWorkers/addMultipleWorkers');
const User = require('../../../models/User');
module.exports = async (req, res) => {
  console.log('body of request', req.body);
  const { workersInfo, organisationInfo, organisationId } = req.body;

  if (organisationId) {
    console.log('trying to update organisation and add more workers');
    const organisation = await Organisation.findById(organisationId);
    //to check if organisation exists
    if (organisation) {
      //to check if the users id matches the organisations leaders id
      const leader = await User.findOne({
        userUUID: req.user.user_id,
      });
      console.log('user leader <' + leader._id + '>');
      console.log('leaderId <' + organisation.leaderId + '>');
      if (leader._id.equals(organisation.leaderId)) {
        const addedWorkerIds = await addMultipleWorkers(workersInfo);
        console.log('added worker ids: ', addedWorkerIds);
        // addMultipleWorkers();
        await Organisation.findByIdAndUpdate(
          organisationId,
          {
            workers: [...organisation.workers, addedWorkerIds],
          },
          (err, organisationDoc) => {
            if (!err) {
              console.log('organisation updated=> ', organisationDoc);

              return res.status(200).send({
                message: 'new workers added and organisation updated',
                data: organisationDoc,
              });
            }
          }
        );
      } else {
        return res.status(403).send({
          message: 'You are not authorized to carry out this action',
        });
      }
    } else {
      return res.status(404).send({
        message: 'This Organisation does not exist',
      });
    }
  } else {
    //create new organisation
    const addedWorkerIds = await addMultipleWorkers(workersInfo);
    //also update creater
    const leader = await User.findOne({
      userUUID: req.user.user_id,
    });
    const newOrganisation = new Organisation({
      name: organisationInfo.name,
      city: organisationInfo.city,
      domain: organisationInfo.domain,
      leaderId: leader._id,
      workers: addedWorkerIds,
    });

    await newOrganisation.save();

    leader.organisations = [...leader.organisations, newOrganisation._id];
    await leader.save();

    return res.status(200).send({
      message: 'New organisation created',
      data: newOrganisation,
    });
  }
  // console.log("mappings : ", pinCodeToDistrictMap);
};

// module.exports = async (req, res) => {
//   console.log('body of request', req.body);
//   const { workersInfo } = req.body;
//   console.log('trying to update organisation and add more workers');
//   //console.log("user leader <" + leader._id + ">");
//   //console.log("leaderId <" + organisation.leaderId + ">");
//   const addedWorkerIds = await addMultipleWorkers(workersInfo);
//   if (addedWorkerIds) {
//     return res.status(200).send({
//       data: addedWorkerIds,
//     });
//   } else {
//     return res.status(403).send({
//       message: 'The workers might not have been added',
//     });
//   }
//   console.log('added worker ids: ', addedWorkerIds);
// };
// console.log("mappings : ", pinCodeToDistrictMap);
