
....NOW UNUSED... Data comes directly from snapshot of RESRICDBDEV04.HHOW_DataVis_DEV.[dbo].[SpecimensV1]...





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


-- NEW VERSION --

use NavigatorMapping
go

with SpecimenCollectionProtocolLookup as (
	SELECT [SpecimenID], min(CtepStudyID) as CtepStudyID
	FROM [NavigatorMapping].[dbo].[StageNavigatorProtocolsFromBankDataWarehouse]
	where IsCollectionProtocol=1
	group by [SpecimenID], [ProtocolName]
)
create view SpecimensV1 as
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
	case when Studies.ProtocolCategory like '%\%' 
		then reverse(left(reverse(Studies.ProtocolCategory), charindex('\', reverse(Studies.ProtocolCategory)) -1)) 
		else Studies.ProtocolCategory
	end as ProtocolCategory,

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
	left outer join resc3prod.CTEPIQ.dbo.CTEP_COG_StudiesCategorized as [Studies] on Studies.CTEP_STUDY_ID = SpecimenCollectionProtocolLookup.CtepStudyID
where
	specimenAccessStatus = 1 and
	collectionDateTime is not null and 
	stage.STARS_StatisticalGroup='COG' and 
	Studies.ProtocolCategory is not null
group by
	cast(collectionDateTime as date),
	specimenBiophysicalType,
	preservationType,
	fmaAnatomicSourceLocation,
	pathologicalStatus,
	diseaseStatus,
	org.name,
	SpecimenCollectionProtocolLookup.CtepStudyID,
	Studies.ProtocolCategory
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

select *
FROM [NavigatorMapping].[dbo].[StageNavigatorProtocolsFromBankDataWarehouse]
where PrimarySponsorGroup = 'COG' and IsCollectionProtocol=1

with data as (
	select ProtocolName, ProvisionalDiagnosis, count(*) as RecordCount
	from BankDataWarehouse.dbo.SpecimenProtocols
	where PrimarySponsorGroup='COG' and IsCollectionProtocol=1
	group by ProtocolName, ProvisionalDiagnosis
	--order by 3 desc
	)
select data.*, sum(recordcount) over (order by recordcount desc rows unbounded preceding) as running_total
from data



-- 
-- NEW NEW VERSION in new database: RESRICDBDEV04 HHOW_DataVis_DEV
--

if object_id('dbo.SpecimensV1') is not null
	drop view SpecimensV1;
go

create view SpecimensV1 as
with SpecimenCollectionProtocolLookup as (
	SELECT [SpecimenID], min(CtepStudyID) as CtepStudyID
	FROM [NavigatorMapping].[dbo].[StageNavigatorProtocolsFromBankDataWarehouse]
	where IsCollectionProtocol=1
	group by [SpecimenID], [ProtocolName]
)
select -- top 10000
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
	Studies.ProtocolCategory,
	/*
	case when Studies.ProtocolCategory like '% \ %' 
		then reverse(left(reverse(Studies.ProtocolCategory), charindex(' \ ', reverse(Studies.ProtocolCategory)) -1)) 
		else Studies.ProtocolCategory
	end as ProtocolCategory,
	*/

	/*
	case
		when Studies.CONDITION_NAME_SET = '||' then '(Unknown/Unmapped)'
		else substring(Studies.CONDITION_NAME_SET,2,CHARINDEX('|',Studies.CONDITION_NAME_SET,2)-2) 
	end Disease,
	*/
	count(distinct barcode) as SpecimenCount
from [NavigatorMapping].[dbo].[StageNavigatorMappingFromBankDataWarehouse] stage
	left outer join resc3prod.[CTEPIQ].[dbo].[Organizations] org on InstitutionID_CTEP = org.CTEP_ID
	left outer join SpecimenCollectionProtocolLookup on stage.bdwpk_SpecimenID = SpecimenCollectionProtocolLookup.SpecimenID
	left outer join resc3prod.CTEPIQ.dbo.CTEP_COG_StudiesCategorized as [Studies] on Studies.CTEP_STUDY_ID = SpecimenCollectionProtocolLookup.CtepStudyID
where
	specimenAccessStatus = 1 and
	collectionDateTime is not null and 
	stage.STARS_StatisticalGroup='COG' 
	-- and Studies.ProtocolCategory is not null
group by
	cast(collectionDateTime as date),
	specimenBiophysicalType,
	preservationType,
	fmaAnatomicSourceLocation,
	pathologicalStatus,
	diseaseStatus,
	org.name,
	SpecimenCollectionProtocolLookup.CtepStudyID,
	Studies.ProtocolCategory;
go

if object_id('dbo.SpecimensV1_Snapshot') is not null
	drop table SpecimensV1_Snapshot;
go

select *
into SpecimensV1_Snapshot
from SpecimensV1;

select coalesce(ProtocolCategory, '(Unmapped)') as ProtocolCategory, sum(SpecimenCount)
from SpecimensV1_Snapshot
group by ProtocolCategory
order by 1;