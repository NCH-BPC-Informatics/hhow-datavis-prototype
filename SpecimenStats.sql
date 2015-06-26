select top 10000
	/* participantId,
	Barcode,
	currentAmount,
	unitOfMeasure, */
	cast(collectionDateTime as date) as collectionDate,
	-- */
	specimenBiophysicalType,
	preservationType,
	fmaAnatomicSourceLocation,
	pathologicalStatus,
	diseaseStatus,
	-- collectionTimePoint,
	org.name collectionInstitution,
	count(distinct barcode) as SpecimenCount
from [NavigatorMapping].[dbo].[StageNavigatorMappingFromBankDataWarehouse] stage
	left outer join resc3prod.[CTEPIQ].[dbo].[Organizations] org on InstitutionID_CTEP = org.CTEP_ID
where
	specimenAccessStatus = 1 and
	collectionDateTime is not null
group by
	cast(collectionDateTime as date),
	specimenBiophysicalType,
	preservationType,
	fmaAnatomicSourceLocation,
	pathologicalStatus,
	diseaseStatus,
	-- collectionTimePoint,
	org.name
order by newid();