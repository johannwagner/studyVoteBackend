CREATE DATABASE  IF NOT EXISTS `studyvote` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `studyvote`;
-- MySQL dump 10.13  Distrib 5.7.9, for Win64 (x86_64)
--
-- Host: localhost    Database: studyvote
-- ------------------------------------------------------
-- Server version	5.7.11-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admissionRequirement`
--

DROP TABLE IF EXISTS `admissionRequirement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admissionRequirement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `courseInstanceId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ar_courseInstanceId` (`courseInstanceId`),
  KEY `FK_admissionRequirement_admissionRequirement_idx` (`courseInstanceId`),
  CONSTRAINT `FK_admissionRequirement_admissionRequirement` FOREIGN KEY (`courseInstanceId`) REFERENCES `courseInstance` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=120 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admissionRequirement`
--

LOCK TABLES `admissionRequirement` WRITE;
/*!40000 ALTER TABLE `admissionRequirement` DISABLE KEYS */;
INSERT INTO `admissionRequirement` VALUES (116,111),(118,137),(119,138),(117,142);
/*!40000 ALTER TABLE `admissionRequirement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admissionRequirementItem`
--

DROP TABLE IF EXISTS `admissionRequirementItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admissionRequirementItem` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admissionRequirementType` int(11) NOT NULL,
  `expireDate` timestamp NULL DEFAULT NULL,
  `maxTasks` int(11) DEFAULT NULL,
  `minTasks` int(11) DEFAULT NULL,
  `minPercentage` double DEFAULT NULL,
  `mandatory` tinyint(4) DEFAULT NULL,
  `admissionRequirementId` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_admissionRequirementItem_admissionRequirement` (`admissionRequirementId`),
  CONSTRAINT `FK_admissionRequirementItem_admissionRequirement` FOREIGN KEY (`admissionRequirementId`) REFERENCES `admissionRequirement` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admissionRequirementItem`
--

LOCK TABLES `admissionRequirementItem` WRITE;
/*!40000 ALTER TABLE `admissionRequirementItem` DISABLE KEYS */;
INSERT INTO `admissionRequirementItem` VALUES (154,0,'2018-01-02 13:08:47',50,35,70,1,116,'Voting Tasks'),(155,1,'2017-12-19 13:09:17',1,0,100,1,116,'Pass pre-exam'),(156,0,'2018-01-02 13:48:45',NULL,NULL,66,1,117,'Voting'),(157,1,'2018-01-29 10:46:32',NULL,NULL,NULL,1,118,'Group Work'),(158,0,'2018-01-03 10:47:09',48,32,66,1,118,'Weekly Tasks'),(159,0,'2018-01-03 10:51:06',110,55,50,1,119,'Programming Tasks'),(160,0,'2018-01-03 10:54:18',35,24,66,1,119,'Weekly Tasks');
/*!40000 ALTER TABLE `admissionRequirementItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admissionRequirementItemWeek`
--

DROP TABLE IF EXISTS `admissionRequirementItemWeek`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admissionRequirementItemWeek` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `maxCount` int(11) NOT NULL,
  `creationUserId` int(11) NOT NULL,
  `admissionRequirementItemId` int(11) NOT NULL,
  `semesterWeek` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_aritemweek_semesterWeek_arItemId` (`semesterWeek`,`admissionRequirementItemId`),
  KEY `FK_admissionRequirementItemWeek_user` (`creationUserId`),
  KEY `FK_admissionRequirementItemWeek_admissionRequirementItem` (`admissionRequirementItemId`),
  CONSTRAINT `FK_admissionRequirementItemWeek_user` FOREIGN KEY (`creationUserId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_admissionRequirementItemWeek_admissionRequirementItem` FOREIGN KEY (`admissionRequirementItemId`) REFERENCES `admissionRequirementItem` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=282 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admissionRequirementItemWeek`
--

LOCK TABLES `admissionRequirementItemWeek` WRITE;
/*!40000 ALTER TABLE `admissionRequirementItemWeek` DISABLE KEYS */;
INSERT INTO `admissionRequirementItemWeek` VALUES (264,'2018-01-02 14:24:35',4,50,154,9),(265,'2018-01-02 14:24:46',5,50,154,1),(266,'2018-01-02 14:24:51',5,50,154,2),(267,'2018-01-02 14:26:15',5,50,154,3),(268,'2018-01-02 14:26:24',5,50,154,4),(269,'2018-01-02 14:26:33',5,50,154,5),(270,'2018-01-02 14:26:35',5,50,154,6),(271,'2018-01-02 14:26:53',5,50,154,7),(272,'2018-01-02 14:42:31',5,50,154,11),(273,'2018-01-02 14:42:57',5,50,154,12),(274,'2018-01-02 14:49:09',4,50,156,1),(275,'2018-01-02 14:49:13',4,50,156,2),(276,'2018-01-02 14:49:21',4,50,156,3),(277,'2018-01-02 14:49:25',4,50,156,4),(278,'2018-01-02 14:49:31',4,50,156,5),(279,'2018-01-02 14:49:39',3,50,156,6),(280,'2018-01-02 14:49:47',4,50,156,7),(281,'2018-01-03 10:27:36',1,50,155,1);
/*!40000 ALTER TABLE `admissionRequirementItemWeek` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `shortName` varchar(10) NOT NULL,
  `displayName` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=131 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (99,'BV','Bildverarbeitung'),(100,'BV','Bildverarbeitung'),(101,'BV','Bildverarbeitung'),(102,'BV','Bildverarbeitung'),(103,'BV','Bildverarbeitung'),(104,'BV','Bildverarbeitung'),(105,'BV','Bildverarbeitung'),(106,'BV','Bildverarbeitung'),(107,'BV','Bildverarbeitung'),(108,'BV','Bildverarbeitung'),(109,'BV','Bildverarbeitung'),(110,'BV','Bildverarbeitung'),(111,'BV','Bildverarbeitung'),(112,'BV','Bildverarbeitung'),(113,'BV','Bildverarbeitung'),(114,'BV','Bildverarbeitung'),(115,'BV','Bildverarbeitung'),(116,'BV','Bildverarbeitung'),(117,'BV','Bildverarbeitung'),(118,'BV','Bildverarbeitung'),(119,'BV','Bildverarbeitung'),(120,'BV','Bildverarbeitung'),(121,'BV','Bildverarbeitung'),(122,'BV','Bildverarbeitung'),(123,'BV','Bildverarbeitung'),(124,'123','123'),(125,'ARCADE','Architecting and Engineering Main Memory Database Systems in Modern C'),(126,'ML','Machine Learning'),(127,'MFR','Materialflussrechnung'),(128,'SoMSEaDC','Seminar on Modern Software Engineering and Database Concepts'),(129,'TEst1','asdas'),(130,'IS','Intelligte Systeme');
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courseInstance`
--

DROP TABLE IF EXISTS `courseInstance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courseInstance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `semesterId` int(11) NOT NULL,
  `courseId` int(11) NOT NULL,
  `room` text,
  `docent` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_courseInstance_courseId_semesterId` (`courseId`,`semesterId`),
  KEY `FK_courseInstance_semester` (`semesterId`),
  KEY `FK_courseInstance_course` (`courseId`),
  CONSTRAINT `FK_courseInstance_course` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`),
  CONSTRAINT `FK_courseInstance_semester` FOREIGN KEY (`semesterId`) REFERENCES `semester` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courseInstance`
--

LOCK TABLES `courseInstance` WRITE;
/*!40000 ALTER TABLE `courseInstance` DISABLE KEYS */;
INSERT INTO `courseInstance` VALUES (111,97,99,'207','Turowski'),(136,97,124,'',''),(137,97,125,'Saake','G05-312'),(138,97,126,'Nürnberger','G03-106'),(139,97,127,'Katterfeld','G03-106'),(140,97,128,'Benduhn','G05-300'),(141,97,129,'asdasd',''),(142,97,130,'Mostaghim','307');
/*!40000 ALTER TABLE `courseInstance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courseInstanceGroup`
--

DROP TABLE IF EXISTS `courseInstanceGroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courseInstanceGroup` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `courseInstanceId` int(11) NOT NULL,
  `room` varchar(10) NOT NULL,
  `startTime` timestamp NULL DEFAULT NULL,
  `endTime` timestamp NULL DEFAULT NULL,
  `docent` varchar(255) DEFAULT NULL,
  `weekDay` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_courseInstanceGroup_courseInstance` (`courseInstanceId`),
  CONSTRAINT `FK_courseInstanceGroup_courseInstance` FOREIGN KEY (`courseInstanceId`) REFERENCES `courseInstance` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courseInstanceGroup`
--

LOCK TABLES `courseInstanceGroup` WRITE;
/*!40000 ALTER TABLE `courseInstanceGroup` DISABLE KEYS */;
INSERT INTO `courseInstanceGroup` VALUES (24,142,'G14-125','2018-01-03 08:15:01','2018-01-03 09:45:01','Dominik Weikert',0),(25,142,'G12-129','2018-01-03 10:15:00','2018-01-03 11:45:00','Steup',3),(26,138,'G22A-120','2018-01-03 12:15:01','2018-01-03 13:45:01','Thiel',0);
/*!40000 ALTER TABLE `courseInstanceGroup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `semester`
--

DROP TABLE IF EXISTS `semester`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `semester` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `displayName` text NOT NULL,
  `startDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `endDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `semester`
--

LOCK TABLES `semester` WRITE;
/*!40000 ALTER TABLE `semester` DISABLE KEYS */;
INSERT INTO `semester` VALUES (97,'WS17/18','2017-10-02 22:00:00','2018-03-29 22:00:00');
/*!40000 ALTER TABLE `semester` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `displayName` text NOT NULL,
  `email` text NOT NULL,
  `createDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastLoginDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `passwordHash` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (45,'Fred','0.1686126108362882@feuerstein12.com','2017-11-07 12:44:24','2017-11-07 12:44:24','FredFeuerstein'),(46,'Fred','0.6162441817857365@feuerstein12.com','2017-11-07 12:59:37','2017-11-07 12:59:37','FredFeuerstein'),(47,'Fred','0.4446192087988663@feuerstein12.com','2017-11-07 13:13:59','2017-11-07 13:13:59','FredFeuerstein'),(50,'asd','asd','2017-11-07 13:49:28','2017-11-07 13:49:28','123'),(51,'Fred','0.7203990522911419@feuerstein12.com','2017-11-07 14:27:59','2017-11-07 14:27:59','FredFeuerstein'),(52,'Hallo','test@bullshit.com','2017-11-09 11:53:36','2017-11-09 11:53:36','abc123'),(53,'Fred','0.8866239216764928@feuerstein12.com','2017-11-09 11:56:14','2017-11-09 11:56:14','FredFeuerstein'),(54,'Fred','0.11774902082402638@feuerstein12.com','2017-11-09 11:56:41','2017-11-09 11:56:41','FredFeuerstein'),(55,'Fred','0.560066188553854@feuerstein12.com','2017-11-09 11:58:02','2017-11-09 11:58:02','FredFeuerstein'),(56,'Fred','0.3142260207131169@feuerstein12.com','2017-11-09 11:58:44','2017-11-09 11:58:44','FredFeuerstein'),(57,'Fred','0.8087611683030098@feuerstein12.com','2017-11-09 13:07:43','2017-11-09 13:07:43','FredFeuerstein'),(58,'Fred','0.9404268668461497@feuerstein12.com','2017-11-09 13:08:28','2017-11-09 13:08:28','FredFeuerstein'),(59,'Fred','0.7520110033851772@feuerstein12.com','2017-11-09 13:09:01','2017-11-09 13:09:01','FredFeuerstein'),(60,'Fred','0.26254005306756123@feuerstein12.com','2017-11-09 13:10:44','2017-11-09 13:10:44','FredFeuerstein'),(61,'Fred','0.20389312342616006@feuerstein12.com','2017-11-09 13:11:22','2017-11-09 13:11:22','FredFeuerstein'),(62,'Fred','0.038472999734391555@feuerstein12.com','2017-11-09 13:11:49','2017-11-09 13:11:49','FredFeuerstein'),(63,'Fred','0.8856815928751278@feuerstein12.com','2017-11-09 13:15:44','2017-11-09 13:15:44','FredFeuerstein'),(64,'Fred','0.16671784027013592@feuerstein12.com','2017-11-09 13:16:04','2017-11-09 13:16:04','FredFeuerstein'),(65,'Fred','0.8680377736207285@feuerstein12.com','2017-11-09 13:16:27','2017-11-09 13:16:27','FredFeuerstein'),(66,'Fred','0.12410891743891161@feuerstein12.com','2017-11-09 13:17:05','2017-11-09 13:17:05','FredFeuerstein'),(67,'Fred','0.47716290852967913@feuerstein12.com','2017-11-09 13:18:19','2017-11-09 13:18:19','FredFeuerstein'),(68,'Fred','0.07625983976395845@feuerstein12.com','2017-11-09 13:18:32','2017-11-09 13:18:32','FredFeuerstein'),(69,'Fred','0.9070638826168014@feuerstein12.com','2017-11-09 13:18:45','2017-11-09 13:18:45','FredFeuerstein'),(70,'Fred','0.1501884121346777@feuerstein12.com','2017-11-09 13:19:38','2017-11-09 13:19:38','FredFeuerstein'),(71,'Fred','0.6557770751315635@feuerstein12.com','2017-11-09 13:20:52','2017-11-09 13:20:52','FredFeuerstein'),(72,'Fred','0.09801818261807194@feuerstein12.com','2017-11-09 13:23:39','2017-11-09 13:23:39','FredFeuerstein'),(73,'Fred','0.9916236033049077@feuerstein12.com','2017-11-09 13:26:17','2017-11-09 13:26:17','FredFeuerstein'),(74,'Fred','0.9710194440551938@feuerstein12.com','2017-11-09 13:26:52','2017-11-09 13:26:52','FredFeuerstein'),(75,'test','test','2017-11-22 12:10:55','2017-11-22 12:10:55','test');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userCourseInstance`
--

DROP TABLE IF EXISTS `userCourseInstance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userCourseInstance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `courseInstanceId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_userCourseInstance_courseInstanceId_userId` (`courseInstanceId`,`userId`),
  KEY `FK_userCourseInstance_user` (`userId`),
  KEY `FK_userCourseInstance_courseInstance` (`courseInstanceId`),
  CONSTRAINT `FK_userCourseInstance_courseInstance` FOREIGN KEY (`courseInstanceId`) REFERENCES `courseInstance` (`id`),
  CONSTRAINT `FK_userCourseInstance_user` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userCourseInstance`
--

LOCK TABLES `userCourseInstance` WRITE;
/*!40000 ALTER TABLE `userCourseInstance` DISABLE KEYS */;
INSERT INTO `userCourseInstance` VALUES (1,45,111),(34,50,111),(40,75,111),(2,46,112),(3,47,113),(4,51,114),(5,54,115),(6,55,116),(7,56,117),(8,57,118),(9,58,119),(10,59,120),(11,60,121),(12,61,122),(13,62,123),(14,63,124),(15,64,125),(16,65,126),(17,66,127),(18,67,128),(19,68,129),(20,69,130),(21,70,131),(22,71,132),(23,72,133),(24,73,134),(25,74,135),(41,75,136),(36,50,137),(37,50,138),(42,75,138),(38,50,139),(39,50,140),(43,50,142);
/*!40000 ALTER TABLE `userCourseInstance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userProgress`
--

DROP TABLE IF EXISTS `userProgress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userProgress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `admissionRequirementItemWeekId` int(11) NOT NULL,
  `createDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `taskCount` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_userProgress_userId_aritemWeek` (`userId`,`admissionRequirementItemWeekId`),
  KEY `FK_userProgress_users` (`userId`),
  KEY `FK_userProgress_admissionRequirementItemWeek` (`admissionRequirementItemWeekId`),
  CONSTRAINT `FK_userProgress_users` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `FK_userProgress_admissionRequirementItemWeek` FOREIGN KEY (`admissionRequirementItemWeekId`) REFERENCES `admissionRequirementItemWeek` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=192 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userProgress`
--

LOCK TABLES `userProgress` WRITE;
/*!40000 ALTER TABLE `userProgress` DISABLE KEYS */;
INSERT INTO `userProgress` VALUES (174,50,264,'2018-01-02 14:24:35',4),(175,50,265,'2018-01-02 14:24:46',5),(176,50,266,'2018-01-02 14:24:51',4),(177,50,267,'2018-01-02 14:26:15',3),(178,50,268,'2018-01-02 14:26:24',4),(179,50,269,'2018-01-02 14:26:33',4),(180,50,270,'2018-01-02 14:26:35',4),(181,50,271,'2018-01-02 14:26:53',4),(182,50,272,'2018-01-02 14:42:31',0),(183,50,273,'2018-01-02 14:42:57',0),(184,50,274,'2018-01-02 14:49:09',5),(185,50,275,'2018-01-02 14:49:13',4),(186,50,276,'2018-01-02 14:49:21',4),(187,50,277,'2018-01-02 14:49:25',3),(188,50,278,'2018-01-02 14:49:31',4),(189,50,279,'2018-01-02 14:49:39',4),(190,50,280,'2018-01-02 14:49:47',2),(191,50,281,'2018-01-03 10:27:36',0);
/*!40000 ALTER TABLE `userProgress` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-01-11 13:22:07
