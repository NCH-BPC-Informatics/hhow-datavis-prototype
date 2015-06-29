select CTEP_STUDY_ID, SHORT_TITLE
from [CTEPIQ].dbo.[Studies]
where 
	COOPERATIVE_GROUP_CTEP_ID='COG' and 
	CTEP_STUDY_ID is not null and
	SHORT_TITLE is not null
order by 1;