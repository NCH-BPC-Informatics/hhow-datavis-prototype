-- Save as SpecimenStats20000.csv
with SpecimenCollectionProtocolLookup as (
	SELECT [SpecimenID], min(CtepStudyID) as CtepStudyID
	FROM [NavigatorMapping].[dbo].[StageNavigatorProtocolsFromBankDataWarehouse]
	where IsCollectionProtocol=1
	group by [SpecimenID], [ProtocolName]
)
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
	SpecimenCollectionProtocolLookup.CtepStudyID,
	/*
	case
		when Studies.CONDITION_NAME_SET = '||' then '(Unknown/Unmapped)'
		else substring(Studies.CONDITION_NAME_SET,2,CHARINDEX('|',Studies.CONDITION_NAME_SET,2)-2) 
	end Disease,
	*/
	count(distinct barcode) as SpecimenCount
from [NavigatorMapping].[dbo].[StageNavigatorMappingFromBankDataWarehouse] stage
	left outer join resc3prod.[CTEPIQ].[dbo].[Organizations] org on InstitutionID_CTEP = org.CTEP_ID
	inner join SpecimenCollectionProtocolLookup on stage.bdwpk_SpecimenID = SpecimenCollectionProtocolLookup.SpecimenID
	left outer join resc3prod.[CTEPIQ].[dbo].[Studies] on Studies.CTEP_STUDY_ID = SpecimenCollectionProtocolLookup.CtepStudyID
where
	specimenAccessStatus = 1 and
	collectionDateTime is not null and 
	stage.STARS_StatisticalGroup='COG'
group by
	cast(collectionDateTime as date),
	specimenBiophysicalType,
	preservationType,
	fmaAnatomicSourceLocation,
	pathologicalStatus,
	diseaseStatus,
	-- collectionTimePoint,
	org.name,
	SpecimenCollectionProtocolLookup.CtepStudyID
	/*
	,case
		when Studies.CONDITION_NAME_SET = '||' then '(Unknown/Unmapped)'
		else substring(Studies.CONDITION_NAME_SET,2,CHARINDEX('|',Studies.CONDITION_NAME_SET,2)-2) 
	end
	*/
order by newid();

/*
SELECT distinct CtepStudyID
FROM [NavigatorMapping].[dbo].[StageNavigatorProtocolsFromBankDataWarehouse]
where PrimarySponsorGroup = 'COG' and IsCollectionProtocol=1
order by 1;
*/

-- Save as StudyList.csv
select CTEP_STUDY_ID as CtepStudyID, coalesce(SHORT_TITLE, '') as StudyTitle
from resc3prod.[CTEPIQ].dbo.[Studies]
where 
	COOPERATIVE_GROUP_CTEP_ID='COG' and 
	CTEP_STUDY_ID is not null and
	-- SHORT_TITLE is not null and
	CTEP_STUDY_ID in (
		SELECT distinct CtepStudyID
		FROM [NavigatorMapping].[dbo].[StageNavigatorProtocolsFromBankDataWarehouse]
		where PrimarySponsorGroup = 'COG' and IsCollectionProtocol=1
	)
order by 1;