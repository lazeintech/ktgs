CREATE DATABASE  IF NOT EXISTS `nodelogin` /*!40100 DEFAULT CHARACTER SET utf8 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `nodelogin`;
-- MySQL dump 10.13  Distrib 8.0.28, for macos11 (x86_64)
--
-- Host: localhost    Database: nodelogin
-- ------------------------------------------------------
-- Server version	8.0.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `username` varchar(50) NOT NULL,
  `password` varchar(48) NOT NULL,
  PRIMARY KEY (`username`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES ('abcdef','ffffff'),('admin','password'),('test','test'),('test1','test1'),('tuanna','Abc123');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `classCode` varchar(45) NOT NULL,
  PRIMARY KEY (`classCode`),
  UNIQUE KEY `name_UNIQUE` (`classCode`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'TEST-CLASS'),(2,'NCS26-TPH');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_assignments`
--

DROP TABLE IF EXISTS `job_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `classCode` varchar(45) NOT NULL,
  `username` varchar(50) NOT NULL,
  `assignFrom` date NOT NULL,
  `assignTo` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `classCode_idx` (`classCode`),
  CONSTRAINT `clsCode` FOREIGN KEY (`classCode`) REFERENCES `classes` (`classCode`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_assignments`
--

LOCK TABLES `job_assignments` WRITE;
/*!40000 ALTER TABLE `job_assignments` DISABLE KEYS */;
INSERT INTO `job_assignments` VALUES (1,'TEST-CLASS','test','2022-05-02','2022-05-31');
/*!40000 ALTER TABLE `job_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `semesters`
--

DROP TABLE IF EXISTS `semesters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semesters` (
  `classCode` varchar(48) NOT NULL,
  `semesterCode` varchar(48) NOT NULL,
  PRIMARY KEY (`classCode`),
  UNIQUE KEY `classCode_UNIQUE` (`classCode`),
  UNIQUE KEY `semesterCode_UNIQUE` (`semesterCode`),
  CONSTRAINT `classCode` FOREIGN KEY (`classCode`) REFERENCES `classes` (`classCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `semesters`
--

LOCK TABLES `semesters` WRITE;
/*!40000 ALTER TABLE `semesters` DISABLE KEYS */;
INSERT INTO `semesters` VALUES ('NCS26-TPH','2022');
/*!40000 ALTER TABLE `semesters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stdCode` varchar(45) NOT NULL,
  `classCode` varchar(45) NOT NULL,
  `stdFName` varchar(45) NOT NULL,
  `stdLMName` varchar(45) NOT NULL,
  PRIMARY KEY (`stdCode`),
  UNIQUE KEY `stdCode_UNIQUE` (`stdCode`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `className_idx` (`classCode`),
  CONSTRAINT `className` FOREIGN KEY (`classCode`) REFERENCES `classes` (`classCode`)
) ENGINE=InnoDB AUTO_INCREMENT=570 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (6,'NCS26.TP.01','NCS26-TPH','Bắc','Đào Xuân'),(7,'NCS26.TP.02','NCS26-TPH','Bình','Bùi Quang'),(8,'NCS26.TP.03','NCS26-TPH','Công','Nguyễn Thành'),(9,'NCS26.TP.04','NCS26-TPH','Cường','Đỗ Mạnh'),(10,'NCS26.TP.05','NCS26-TPH','Dũng','Bùi Tiến'),(11,'NCS26.TP.06','NCS26-TPH','Dương','Phan Hải'),(12,'NCS26.TP.07','NCS26-TPH','Duyên','Phạm Minh'),(13,'NCS26.TP.08','NCS26-TPH','Giang','Nguyễn Quỳnh'),(14,'NCS26.TP.09','NCS26-TPH','Hùng','Phạm Văn'),(15,'NCS26.TP.10','NCS26-TPH','Huy','Nguyễn Lê'),(16,'NCS26.TP.11','NCS26-TPH','Linh','Mai Công'),(17,'NCS26.TP.12','NCS26-TPH','Mạnh','Trịnh Văn'),(18,'NCS26.TP.13','NCS26-TPH','Tân','Đỗ Ngọc'),(19,'NCS26.TP.14','NCS26-TPH','Thắng','Lê Văn'),(20,'NCS26.TP.15','NCS26-TPH','Thịnh','Nguyễn Xuân'),(21,'NCS26.TP.16','NCS26-TPH','Thịnh','Nguyễn Đình'),(22,'NCS26.TP.17','NCS26-TPH','Trung','Nguyễn Hữu'),(23,'NCS26.TP.18','NCS26-TPH','Trung','Trần Đức'),(24,'NCS26.TP.19','NCS26-TPH','Trường','Trương Đức'),(2,'std1','TEST-CLASS','A','Nguyen Van'),(3,'std2','TEST-CLASS','B','Nguyen Thi');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `violation_detail`
--

DROP TABLE IF EXISTS `violation_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `violation_detail` (
  `detailId` int NOT NULL AUTO_INCREMENT,
  `job` int NOT NULL,
  `detail` varchar(256) NOT NULL,
  PRIMARY KEY (`detailId`),
  UNIQUE KEY `id_UNIQUE` (`detailId`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `violation_detail`
--

LOCK TABLES `violation_detail` WRITE;
/*!40000 ALTER TABLE `violation_detail` DISABLE KEYS */;
INSERT INTO `violation_detail` VALUES (2,1,'asdfasdf'),(3,1,'ffffffff'),(4,1,'bbbb'),(5,2,'hí hí hí'),(6,1,'quay bài'),(7,3,'giám thị ngủ gật'),(8,2,'làm sai đáp án'),(9,6,'tham dinh luon van'),(10,1,'duyet tu cach thi'),(11,2,'so luong de'),(12,3,'dinh chi'),(13,4,'danh dau bai'),(14,5,'danh dau bai'),(15,6,'sao chep');
/*!40000 ALTER TABLE `violation_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `violation_records`
--

DROP TABLE IF EXISTS `violation_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `violation_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `classCode` varchar(48) NOT NULL,
  `semesterCode` varchar(48) NOT NULL,
  `stdCode` varchar(48) DEFAULT NULL,
  `job` int NOT NULL,
  `detailId` int NOT NULL,
  `detailInfo` varchar(256) NOT NULL,
  `createdBy` varchar(48) NOT NULL,
  `createdDate` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `createdBy_idx` (`createdBy`),
  KEY `detailId_idx` (`detailId`),
  CONSTRAINT `createdBy` FOREIGN KEY (`createdBy`) REFERENCES `accounts` (`username`),
  CONSTRAINT `detailId` FOREIGN KEY (`detailId`) REFERENCES `violation_detail` (`detailId`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `violation_records`
--

LOCK TABLES `violation_records` WRITE;
/*!40000 ALTER TABLE `violation_records` DISABLE KEYS */;
INSERT INTO `violation_records` VALUES (1,'NCS26-TPH','2022','NCS26.TP.01',1,3,'','test',NULL),(2,'NCS26-TPH','2022','NCS26.TP.01',2,5,'','test',NULL),(3,'NCS26-TPH','2022','NCS26.TP.01',1,2,'','test',NULL),(4,'NCS26-TPH','2022','NCS26.TP.01',2,5,'','test','2022-04-22'),(6,'NCS26-TPH','2022','NCS26.TP.02',1,6,'','admin','2022-04-29'),(7,'NCS26-TPH','2022','NCS26.TP.10',1,4,'','admin','2022-04-01'),(8,'NCS26-TPH','2022','NCS26.TP.10',1,4,'','admin','2022-04-01'),(9,'NCS26-TPH','2022','NCS26.TP.10',1,4,'','admin','2022-04-01'),(10,'NCS26-TPH','2022','NCS26.TP.02',1,3,'','admin','2022-04-02'),(11,'NCS26-TPH','2022','NCS26.TP.01',2,5,'','admin','2022-04-02'),(12,'NCS26-TPH','2022','NCS26.TP.02',2,5,'','admin','2022-04-02'),(13,'NCS26-TPH','2022','NCS26.TP.01',2,8,'','admin','2022-03-31'),(14,'NCS26-TPH','2022','NCS26.TP.03',6,9,'','admin','2022-04-01'),(15,'NCS26-TPH','2022','NCS26.TP.01',1,6,'','admin','2022-04-01'),(16,'NCS26-TPH','2022','NCS26.TP.04',6,15,'','admin','2022-04-28'),(17,'NCS26-TPH','testataset',NULL,1,4,'oi doi doi oi','test','2022-03-31');
/*!40000 ALTER TABLE `violation_records` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-05-18  6:28:48
