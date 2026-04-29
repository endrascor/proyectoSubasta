-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-04-2026 a las 11:56:30
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `proyecto_subasta`
--
CREATE DATABASE IF NOT EXISTS `proyecto_subasta` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `proyecto_subasta`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carta`
--

CREATE TABLE `carta` (
  `idCarta` int(11) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `descripcion` varchar(45) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `idEstadoCarta` int(11) NOT NULL,
  `idCondicion` int(11) NOT NULL,
  `fechaRegistro` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `carta`
--

INSERT INTO `carta` (`idCarta`, `nombre`, `descripcion`, `idUsuario`, `idEstadoCarta`, `idCondicion`, `fechaRegistro`) VALUES
(1, 'LUCARIO', 'carta pokemon tcg sdfsdfsdf', 1, 1, 1, '2026-02-11 08:55:00'),
(2, 'Pocion', 'carta pokemon tcg', 1, 1, 2, '2026-02-11 08:55:00'),
(3, 'Poliwhirl', 'Carta pokemon tcg', 1, 1, 3, '2026-02-11 08:55:00'),
(4, 'Latios', 'Pokemon legendario', 1, 1, 1, '2026-03-22 23:20:08'),
(5, 'Latias', 'Pokemon legendario', 1, 1, 1, '2026-03-22 23:20:26'),
(6, 'Mew', 'Pokemon legendario', 1, 1, 1, '2026-03-22 23:21:12'),
(7, 'UMBREON', 'ASDASDASGAGQGQWGQWGQG', 1, 1, 1, '2026-04-19 20:44:51'),
(8, 'Charizard Base Set', 'Carta holográfica primera edición. Estado imp', 6, 1, 1, '2026-04-20 03:32:59'),
(9, 'Mewtwo Base Set', 'Carta rara holográfica del set base original ', 7, 1, 1, '2026-04-20 03:32:59'),
(10, 'Blastoise Holo', 'Blastoise holográfico primera edición en cond', 8, 1, 1, '2026-04-20 03:32:59'),
(11, 'Pikachu Ilustrador', 'Carta promocional extremadamente rara. Solo 3', 6, 1, 1, '2026-04-20 03:32:59'),
(12, 'Gengar Prime', 'Gengar Prime del set HeartGold SoulSilver. Ex', 7, 1, 1, '2026-04-20 03:32:59'),
(13, 'Arceus', 'Arceus dios pokemon totalmente nueva', 14, 1, 1, '2026-04-28 18:57:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carta_categoria`
--

CREATE TABLE `carta_categoria` (
  `idCarta` int(11) NOT NULL,
  `idCategoria` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `carta_categoria`
--

INSERT INTO `carta_categoria` (`idCarta`, `idCategoria`) VALUES
(1, 1),
(1, 4),
(2, 2),
(3, 1),
(3, 6),
(4, 1),
(4, 6),
(5, 1),
(5, 6),
(6, 1),
(6, 4),
(6, 5),
(6, 6),
(7, 1),
(7, 5),
(8, 1),
(8, 5),
(9, 1),
(9, 3),
(10, 1),
(10, 6),
(11, 1),
(11, 4),
(12, 1),
(13, 1),
(13, 2),
(13, 3),
(13, 4),
(13, 5),
(13, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `idCategoria` int(11) NOT NULL,
  `descripcion` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`idCategoria`, `descripcion`) VALUES
(1, 'Pokemon'),
(2, 'Objeto'),
(3, 'Entrenador'),
(4, 'Electrico'),
(5, 'Fuego'),
(6, 'Agua');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `condicion`
--

CREATE TABLE `condicion` (
  `idCondicion` int(11) NOT NULL,
  `descripcion` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `condicion`
--

INSERT INTO `condicion` (`idCondicion`, `descripcion`) VALUES
(1, 'Nuevo'),
(2, 'Usado'),
(3, 'Gradeada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_carta`
--

CREATE TABLE `estado_carta` (
  `idEstadoCarta` int(11) NOT NULL,
  `descripcion` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `estado_carta`
--

INSERT INTO `estado_carta` (`idEstadoCarta`, `descripcion`) VALUES
(1, 'Disponible'),
(2, 'No Disponible'),
(3, 'Agotada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_facturacion`
--

CREATE TABLE `estado_facturacion` (
  `idEstadoFacturacion` int(11) NOT NULL,
  `descripcion` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `estado_facturacion`
--

INSERT INTO `estado_facturacion` (`idEstadoFacturacion`, `descripcion`) VALUES
(1, 'Pendiente'),
(2, 'Confirmado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_subasta`
--

CREATE TABLE `estado_subasta` (
  `idEstadoSubasta` int(11) NOT NULL,
  `descripcion` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `estado_subasta`
--

INSERT INTO `estado_subasta` (`idEstadoSubasta`, `descripcion`) VALUES
(1, 'Activa'),
(2, 'Finalizada'),
(3, 'Cancelada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estado_usuario`
--

CREATE TABLE `estado_usuario` (
  `idEstadoUsuario` int(11) NOT NULL,
  `descripcion` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `estado_usuario`
--

INSERT INTO `estado_usuario` (`idEstadoUsuario`, `descripcion`) VALUES
(1, 'Activo'),
(2, 'Bloqueado'),
(3, 'Inactivo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facturacion`
--

CREATE TABLE `facturacion` (
  `idFacturacion` int(11) NOT NULL,
  `idEstadoFacturacion` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `fechaFactura` datetime NOT NULL,
  `resultado` varchar(45) NOT NULL,
  `monto` decimal(10,0) NOT NULL,
  `idSubasta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `facturacion`
--

INSERT INTO `facturacion` (`idFacturacion`, `idEstadoFacturacion`, `idUsuario`, `fechaFactura`, `resultado`, `monto`, `idSubasta`) VALUES
(10, 2, 5, '2026-04-19 21:03:00', 'Confirmado', 5125, 25),
(11, 2, 5, '2026-04-19 21:09:18', 'Confirmado', 5125, 26),
(12, 2, 5, '2026-04-19 21:18:00', 'Confirmado', 5125, 27),
(13, 2, 5, '2026-04-19 21:24:00', 'Confirmado', 5215, 28),
(14, 2, 4, '2026-04-19 22:14:00', 'Confirmado', 200, 36),
(15, 2, 4, '2026-04-19 22:19:01', 'Confirmado', 300, 37),
(16, 2, 5, '2026-04-19 22:23:00', 'Confirmado', 1100, 38),
(17, 2, 4, '2026-04-19 22:26:00', 'Confirmado', 700, 39),
(18, 2, 5, '2026-04-19 22:32:00', 'Confirmado', 1600, 41),
(19, 2, 5, '2026-04-21 19:17:00', 'Confirmado', 500, 44),
(20, 2, 4, '2026-04-27 17:45:55', 'Confirmado', 200, 45),
(21, 2, 8, '2026-04-27 17:45:56', 'Confirmado', 450, 31),
(22, 2, 4, '2026-04-27 17:45:57', 'Confirmado', 1650, 30),
(23, 2, 5, '2026-04-27 17:45:58', 'Confirmado', 1000, 29),
(24, 2, 13, '2026-04-29 00:45:14', 'Confirmado', 6000, 47);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `imagen_carta`
--

CREATE TABLE `imagen_carta` (
  `id` int(11) NOT NULL,
  `idCarta` int(11) NOT NULL,
  `imagen` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `imagen_carta`
--

INSERT INTO `imagen_carta` (`id`, `idCarta`, `imagen`) VALUES
(3, 2, 'pocion-g188.png'),
(4, 2, 'tcg-card-back.jpg'),
(5, 3, 'poliwhirl-g176.jpg'),
(6, 3, 'tcg-card-back.jpg'),
(7, 4, 'carta-69c0cd887a2ee.jpg'),
(8, 4, 'carta-69c0cd887df9f.jpg'),
(9, 5, 'carta-69c0cd9a72a03.jpg'),
(10, 6, 'carta-69c0cdc850151.jpg'),
(11, 6, 'carta-69c0cdc854cd7.jpg'),
(12, 1, 'carta-69e58b74cb9c7.jpg'),
(13, 7, 'carta-69e59323b37d4.jpg'),
(14, 12, 'carta-69e5a057e809e.jpeg'),
(15, 11, 'carta-69e5a06d5ab2d.jpeg'),
(16, 10, 'carta-69e5a08029025.jpeg'),
(17, 9, 'carta-69e5a096d81f1.jpeg'),
(18, 8, 'carta-69e5a0b22e65b.jpeg'),
(19, 13, 'carta-69f1576be9b7f.png'),
(20, 13, 'carta-69f1576beeb3b.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `puja`
--

CREATE TABLE `puja` (
  `idPuja` int(11) NOT NULL,
  `montoOfertado` decimal(10,0) NOT NULL,
  `fechaPuja` datetime NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `idSubasta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `puja`
--

INSERT INTO `puja` (`idPuja`, `montoOfertado`, `fechaPuja`, `idUsuario`, `idSubasta`) VALUES
(1, 1, '2026-02-11 08:55:00', 2, 1),
(2, 1000, '2026-02-11 08:55:00', 2, 1),
(3, 50000, '2026-08-11 08:55:00', 2, 2),
(4, 200, '2026-03-04 18:00:00', 2, 3),
(5, 1500, '2026-03-04 18:00:00', 2, 4),
(6, 4000, '2026-03-04 18:00:00', 2, 4),
(27, 200, '2026-04-19 20:18:23', 4, 11),
(28, 4124, '2026-04-19 20:18:28', 5, 11),
(29, 4124124, '2026-04-19 20:19:38', 4, 12),
(30, 125125125, '2026-04-19 20:19:41', 5, 12),
(31, 1244, '2026-04-19 20:24:24', 4, 13),
(32, 51251, '2026-04-19 20:24:27', 5, 13),
(33, 222, '2026-04-19 20:45:18', 4, 23),
(34, 4444, '2026-04-19 20:45:21', 5, 23),
(35, 4124, '2026-04-19 21:02:30', 4, 25),
(36, 5125, '2026-04-19 21:02:33', 5, 25),
(37, 5125, '2026-04-19 21:08:28', 5, 26),
(38, 444, '2026-04-19 21:16:23', 4, 27),
(39, 5125, '2026-04-19 21:16:42', 5, 27),
(40, 250, '2026-04-19 21:23:01', 4, 28),
(41, 512, '2026-04-19 21:23:05', 5, 28),
(42, 5215, '2026-04-19 21:23:59', 5, 28),
(43, 550, '2026-04-19 22:33:33', 4, 29),
(44, 600, '2026-04-19 23:33:33', 5, 29),
(45, 700, '2026-04-20 00:33:33', 6, 29),
(46, 800, '2026-04-20 01:33:33', 4, 29),
(47, 900, '2026-04-20 02:33:33', 7, 29),
(48, 1000, '2026-04-20 03:03:33', 5, 29),
(49, 900, '2026-04-19 21:33:33', 7, 30),
(50, 1000, '2026-04-19 22:33:33', 5, 30),
(51, 1100, '2026-04-19 23:33:33', 4, 30),
(52, 1200, '2026-04-20 00:33:33', 8, 30),
(53, 1350, '2026-04-20 01:33:33', 6, 30),
(54, 1500, '2026-04-20 02:33:33', 5, 30),
(55, 1650, '2026-04-20 03:13:33', 4, 30),
(56, 325, '2026-04-19 23:33:33', 4, 31),
(57, 350, '2026-04-20 00:33:33', 6, 31),
(58, 375, '2026-04-20 01:33:33', 7, 31),
(59, 400, '2026-04-20 02:33:33', 5, 31),
(60, 450, '2026-04-20 03:03:33', 8, 31),
(61, 2200, '2026-04-19 19:33:33', 5, 32),
(62, 2400, '2026-04-19 21:33:33', 8, 32),
(63, 2600, '2026-04-19 23:33:33', 4, 32),
(64, 2800, '2026-04-20 00:33:33', 7, 32),
(65, 3000, '2026-04-20 01:33:33', 5, 32),
(66, 3200, '2026-04-20 02:33:33', 6, 32),
(67, 3500, '2026-04-20 03:03:33', 4, 32),
(68, 500, '2026-04-19 22:33:33', 6, 33),
(69, 550, '2026-04-19 23:33:33', 4, 33),
(70, 600, '2026-04-20 00:33:33', 8, 33),
(71, 650, '2026-04-20 01:33:33', 5, 33),
(72, 700, '2026-04-20 02:33:33', 7, 33),
(73, 750, '2026-04-20 03:03:33', 4, 33),
(74, 200, '2026-04-19 22:13:14', 4, 36),
(75, 40135, '2026-04-19 22:14:56', 4, 8),
(76, 40540, '2026-04-19 22:15:01', 5, 8),
(77, 40675, '2026-04-19 22:15:28', 4, 8),
(78, 200, '2026-04-19 22:17:53', 4, 37),
(79, 300, '2026-04-19 22:18:03', 4, 37),
(80, 200, '2026-04-19 22:22:06', 5, 38),
(81, 500, '2026-04-19 22:22:14', 4, 38),
(82, 1100, '2026-04-19 22:22:33', 5, 38),
(83, 700, '2026-04-19 22:25:45', 4, 39),
(84, 700, '2026-04-19 22:31:25', 5, 41),
(85, 1000, '2026-04-19 22:31:36', 4, 41),
(86, 1600, '2026-04-19 22:31:50', 5, 41),
(87, 20111, '2026-04-21 16:12:32', 4, 6),
(88, 20222, '2026-04-21 16:13:13', 4, 6),
(89, 200, '2026-04-21 19:16:23', 4, 44),
(90, 500, '2026-04-21 19:16:26', 5, 44),
(91, 200, '2026-04-21 19:20:58', 4, 45),
(92, 20333, '2026-04-22 01:34:34', 4, 6),
(93, 20444, '2026-04-27 17:46:56', 4, 6),
(94, 10100, '2026-04-28 18:47:09', 12, 5),
(95, 10200, '2026-04-28 20:12:35', 13, 5),
(96, 10300, '2026-04-28 20:13:29', 14, 5),
(97, 5500, '2026-04-02 12:00:00', 13, 10),
(98, 6000, '2026-04-03 12:00:00', 13, 10),
(99, 2500, '2026-03-02 12:00:00', 13, 11),
(100, 3000, '2026-03-03 12:00:00', 13, 11),
(101, 8500, '2026-02-05 12:00:00', 13, 12),
(102, 3500, '2026-01-10 12:00:00', 13, 13),
(103, 5500, '2026-04-02 12:00:00', 13, 47),
(104, 6000, '2026-04-03 12:00:00', 13, 47),
(105, 2500, '2026-03-02 12:00:00', 13, 48),
(106, 3000, '2026-03-03 12:00:00', 13, 48),
(107, 8500, '2026-02-05 12:00:00', 13, 49),
(108, 3500, '2026-01-10 12:00:00', 13, 50),
(109, 10666, '2026-04-29 01:17:48', 13, 5),
(110, 10966, '2026-04-29 01:18:00', 13, 5),
(111, 11566, '2026-04-29 01:18:11', 13, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `idRol` int(11) NOT NULL,
  `nombre` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`idRol`, `nombre`) VALUES
(1, 'Vendedor'),
(2, 'Comprador'),
(3, 'Administrador');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subasta`
--

CREATE TABLE `subasta` (
  `idSubasta` int(11) NOT NULL,
  `fechaInicio` datetime NOT NULL,
  `fechaCierre` datetime NOT NULL,
  `precio` decimal(10,0) NOT NULL,
  `incrementoMin` decimal(10,0) NOT NULL,
  `idEstadoSubasta` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `idCarta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `subasta`
--

INSERT INTO `subasta` (`idSubasta`, `fechaInicio`, `fechaCierre`, `precio`, `incrementoMin`, `idEstadoSubasta`, `idUsuario`, `idCarta`) VALUES
(1, '2026-03-01 18:00:00', '2026-03-05 18:00:00', 2, 2, 2, 1, 1),
(2, '2026-02-10 18:00:00', '2026-02-28 18:00:00', 5, 10, 2, 1, 1),
(3, '2026-03-02 18:00:00', '2026-03-10 18:00:00', 1000, 100, 2, 1, 2),
(4, '2026-03-02 18:00:00', '2026-03-10 18:00:00', 20000, 1000, 2, 1, 3),
(5, '2026-03-23 05:25:00', '2026-10-22 05:21:00', 10000, 100, 1, 1, 4),
(6, '2026-03-22 09:22:00', '2026-11-13 05:22:00', 20000, 111, 1, 1, 5),
(7, '2026-03-21 05:22:00', '2026-10-08 05:22:00', 90000, 2000, 1, 1, 2),
(8, '2026-03-23 05:26:00', '2026-11-19 05:23:00', 40000, 135, 1, 1, 3),
(9, '2026-03-23 05:26:00', '2026-05-03 05:28:00', 12312, 5555, 1, 1, 6),
(10, '2026-04-20 02:12:00', '2026-04-20 02:14:00', 100, 100, 2, 1, 1),
(11, '2026-04-20 02:17:00', '2026-04-20 02:19:00', 100, 100, 2, 1, 1),
(12, '2026-04-20 02:19:00', '2026-04-20 02:20:00', 737, 3473, 2, 1, 1),
(13, '2026-04-20 02:24:00', '2026-04-20 02:25:00', 123, 123, 2, 1, 1),
(14, '2026-04-20 02:28:57', '2026-04-20 02:33:57', 1000, 100, 2, 1, 2),
(17, '2026-04-20 02:34:06', '2026-04-20 02:39:06', 1000, 100, 2, 1, 2),
(20, '2026-04-20 02:34:08', '2026-04-20 02:39:08', 1000, 100, 2, 1, 2),
(22, '2026-04-20 02:34:10', '2026-04-20 02:39:10', 1000, 100, 2, 1, 2),
(23, '2026-04-20 02:44:00', '2026-04-20 02:47:00', 111, 111, 2, 1, 7),
(24, '2026-04-20 03:00:30', '2026-04-20 03:02:30', 100, 50, 2, 4, 1),
(25, '2026-04-20 03:01:00', '2026-04-20 03:03:00', 150, 100, 2, 1, 7),
(26, '2026-04-20 03:07:18', '2026-04-20 03:09:18', 100, 50, 2, 4, 1),
(27, '2026-04-20 03:16:00', '2026-04-20 03:18:00', 111, 111, 2, 1, 7),
(28, '2026-04-20 03:22:00', '2026-04-20 03:24:00', 125, 125, 2, 1, 7),
(29, '2026-04-20 03:32:59', '2026-04-23 03:32:59', 500, 50, 2, 6, 8),
(30, '2026-04-20 03:32:59', '2026-04-25 03:32:59', 800, 100, 2, 7, 9),
(31, '2026-04-20 03:32:59', '2026-04-27 03:32:59', 300, 25, 2, 8, 10),
(32, '2026-04-20 03:32:59', '2026-04-30 03:32:59', 2000, 200, 1, 6, 11),
(33, '2026-04-20 03:32:59', '2026-05-05 03:32:59', 450, 50, 1, 7, 12),
(34, '2026-04-20 03:54:00', '2026-04-20 03:55:00', 111, 111, 2, 1, 7),
(35, '2026-04-20 04:09:00', '2026-04-20 04:15:00', 100, 200, 3, 1, 7),
(36, '2026-04-20 04:12:00', '2026-04-20 04:14:00', 100, 100, 2, 1, 7),
(37, '2026-04-20 04:17:00', '2026-04-20 04:19:00', 100, 100, 2, 1, 7),
(38, '2026-04-20 04:21:00', '2026-04-20 04:23:00', 100, 100, 2, 1, 7),
(39, '2026-04-20 04:24:00', '2026-04-20 04:26:00', 100, 500, 2, 1, 7),
(40, '2026-04-20 04:26:00', '2026-04-20 04:28:00', 1000, 1000, 2, 1, 7),
(41, '2026-04-20 04:30:00', '2026-04-20 04:32:00', 100, 100, 2, 1, 7),
(42, '2026-04-20 04:33:00', '2026-04-20 04:35:00', 100, 100, 2, 1, 7),
(43, '2026-04-20 04:36:00', '2026-04-20 04:38:00', 100, 100, 2, 1, 7),
(44, '2026-04-22 01:15:00', '2026-04-22 01:17:00', 100, 100, 2, 1, 7),
(45, '2026-04-23 01:20:00', '2026-04-24 01:20:00', 100, 100, 2, 1, 7),
(46, '2026-04-29 02:13:00', '2026-04-29 02:19:00', 100, 100, 2, 14, 13),
(47, '2026-04-01 10:00:00', '2026-04-10 10:00:00', 5000, 500, 2, 14, 1),
(48, '2026-03-01 10:00:00', '2026-03-05 10:00:00', 2000, 200, 2, 14, 2),
(49, '2026-02-01 10:00:00', '2026-02-10 10:00:00', 8000, 1000, 2, 14, 3),
(50, '2026-01-01 10:00:00', '2026-01-15 10:00:00', 3000, 300, 2, 14, 4),
(51, '2026-04-29 07:31:00', '2026-04-29 07:34:00', 222, 222, 2, 14, 13);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `idUsuario` int(11) NOT NULL,
  `cedula` varchar(45) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `password` mediumtext NOT NULL,
  `idRol` int(11) NOT NULL,
  `idEstadoUsuario` int(11) NOT NULL,
  `fechaRegistro` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`idUsuario`, `cedula`, `nombre`, `email`, `password`, `idRol`, `idEstadoUsuario`, `fechaRegistro`) VALUES
(1, '119330734', 'Dilan Sanchez Acuña', 'endrascorplay@gmail.com', '$2y$10$y8Slq6SJIuf.PawJuBnmM.knw4CWpeECiDhDw9QCfSjqSt7cxyovS', 1, 1, '2026-02-11 08:55:00'),
(2, '1111111', 'jose ', 'ee', '$2y$10$y8Slq6SJIuf.PawJuBnmM.knw4CWpeECiDhDw9QCfSjqSt7cxyovS', 2, 1, '2026-02-11 08:55:00'),
(3, '5343545', 'Kendall', 'admin554@gmail.com', '$2y$10$y8Slq6SJIuf.PawJuBnmM.knw4CWpeECiDhDw9QCfSjqSt7cxyovS', 3, 1, '2026-03-02 08:55:00'),
(4, '0001', 'Carlos Méndez', 'carlos@test.com', '$2y$10$y8Slq6SJIuf.PawJuBnmM.knw4CWpeECiDhDw9QCfSjqSt7cxyovS', 2, 1, '2026-04-20 02:16:49'),
(5, '0002', 'Laura Jiménez', 'laura@test.com', '$2y$10$y8Slq6SJIuf.PawJuBnmM.knw4CWpeECiDhDw9QCfSjqSt7cxyovS', 2, 1, '2026-04-20 02:16:49'),
(6, '111111111', 'María González', 'maria@test.com', '$2y$10$y8Slq6SJIuf.PawJuBnmM.knw4CWpeECiDhDw9QCfSjqSt7cxyovS', 2, 1, '2026-04-20 03:32:59'),
(7, '222222222', 'Pedro Ramírez', 'pedro@test.com', '$2y$10$y8Slq6SJIuf.PawJuBnmM.knw4CWpeECiDhDw9QCfSjqSt7cxyovS', 2, 1, '2026-04-20 03:32:59'),
(8, '333333333', 'Ana Vargas', 'ana@test.com', '$2y$10$y8Slq6SJIuf.PawJuBnmM.knw4CWpeECiDhDw9QCfSjqSt7cxyovS', 2, 1, '2026-04-20 03:32:59'),
(9, '444444444', 'Roberto Solís', 'roberto@test.com', '$2y$10$y8Slq6SJIuf.PawJuBnmM.knw4CWpeECiDhDw9QCfSjqSt7cxyovS', 1, 1, '2026-04-20 03:32:59'),
(10, '555555555', 'Carmen Flores', 'carmen@test.com', '$2y$10$y8Slq6SJIuf.PawJuBnmM.knw4CWpeECiDhDw9QCfSjqSt7cxyovS', 1, 1, '2026-04-20 03:32:59'),
(11, '666666666', 'Luis Mora', 'luis@test.com', '$2y$10$y8Slq6SJIuf.PawJuBnmM.knw4CWpeECiDhDw9QCfSjqSt7cxyovS', 1, 1, '2026-04-20 03:32:59'),
(12, '208340473', 'Kendall', 'sonix0925@hotmail.com', '$2y$10$OwjlIOH/vGzlVvD6CZbqju3rFvOw8bvfCTafMFsji9TeNFHVG4YD6', 3, 1, '2026-04-28 17:42:55'),
(13, '208230473', 'Kendall COMPRADOR', 'sonix0910@hotmail.com', '$2y$10$MO3aQb0pV1GisjzVdTRhQ.rYurx/NrQprilgxEkwkKr0uIS.j625m', 2, 1, '2026-04-28 18:17:56'),
(14, '208340424', 'Kendall VENDEDOR', 'sonix0945@hotmail.com', '$2y$10$y8Slq6SJIuf.PawJuBnmM.knw4CWpeECiDhDw9QCfSjqSt7cxyovS', 1, 1, '2026-04-28 18:18:21');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carta`
--
ALTER TABLE `carta`
  ADD PRIMARY KEY (`idCarta`),
  ADD KEY `fk_carta_usuario_idx` (`idUsuario`),
  ADD KEY `fk_carta_estado_idx` (`idEstadoCarta`),
  ADD KEY `fk_carta_condicion_idx` (`idCondicion`);

--
-- Indices de la tabla `carta_categoria`
--
ALTER TABLE `carta_categoria`
  ADD PRIMARY KEY (`idCarta`,`idCategoria`),
  ADD KEY `kf_categoria_idx` (`idCategoria`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`idCategoria`);

--
-- Indices de la tabla `condicion`
--
ALTER TABLE `condicion`
  ADD PRIMARY KEY (`idCondicion`);

--
-- Indices de la tabla `estado_carta`
--
ALTER TABLE `estado_carta`
  ADD PRIMARY KEY (`idEstadoCarta`);

--
-- Indices de la tabla `estado_facturacion`
--
ALTER TABLE `estado_facturacion`
  ADD PRIMARY KEY (`idEstadoFacturacion`);

--
-- Indices de la tabla `estado_subasta`
--
ALTER TABLE `estado_subasta`
  ADD PRIMARY KEY (`idEstadoSubasta`);

--
-- Indices de la tabla `estado_usuario`
--
ALTER TABLE `estado_usuario`
  ADD PRIMARY KEY (`idEstadoUsuario`);

--
-- Indices de la tabla `facturacion`
--
ALTER TABLE `facturacion`
  ADD PRIMARY KEY (`idFacturacion`),
  ADD KEY `fk_facturacion_usuario_idx` (`idUsuario`),
  ADD KEY `fk_estado_facturacion_idx` (`idEstadoFacturacion`),
  ADD KEY `fk_facturacion_subasta_idx` (`idSubasta`);

--
-- Indices de la tabla `imagen_carta`
--
ALTER TABLE `imagen_carta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_imagen_carta_idx` (`idCarta`);

--
-- Indices de la tabla `puja`
--
ALTER TABLE `puja`
  ADD PRIMARY KEY (`idPuja`),
  ADD KEY `fk_puja_usuario_idx` (`idUsuario`),
  ADD KEY `fk_puja_subasta_idx` (`idSubasta`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`idRol`);

--
-- Indices de la tabla `subasta`
--
ALTER TABLE `subasta`
  ADD PRIMARY KEY (`idSubasta`),
  ADD KEY `fk_subasta_estado_idx` (`idEstadoSubasta`),
  ADD KEY `fk_subasta_usuario_idx` (`idUsuario`),
  ADD KEY `fk_subasta_carta_idx` (`idCarta`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`idUsuario`),
  ADD UNIQUE KEY `cedula_UNIQUE` (`cedula`),
  ADD UNIQUE KEY `correo_UNIQUE` (`email`),
  ADD KEY `fk_usuario_rol_idx` (`idRol`),
  ADD KEY `fk_usuario_estado_idx` (`idEstadoUsuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carta`
--
ALTER TABLE `carta`
  MODIFY `idCarta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `idCategoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `condicion`
--
ALTER TABLE `condicion`
  MODIFY `idCondicion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `estado_carta`
--
ALTER TABLE `estado_carta`
  MODIFY `idEstadoCarta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `estado_facturacion`
--
ALTER TABLE `estado_facturacion`
  MODIFY `idEstadoFacturacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `estado_subasta`
--
ALTER TABLE `estado_subasta`
  MODIFY `idEstadoSubasta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `estado_usuario`
--
ALTER TABLE `estado_usuario`
  MODIFY `idEstadoUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `facturacion`
--
ALTER TABLE `facturacion`
  MODIFY `idFacturacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `imagen_carta`
--
ALTER TABLE `imagen_carta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `puja`
--
ALTER TABLE `puja`
  MODIFY `idPuja` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `idRol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `subasta`
--
ALTER TABLE `subasta`
  MODIFY `idSubasta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `idUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carta`
--
ALTER TABLE `carta`
  ADD CONSTRAINT `fk_carta_condicion` FOREIGN KEY (`idCondicion`) REFERENCES `condicion` (`idCondicion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_carta_estadoCarta` FOREIGN KEY (`idEstadoCarta`) REFERENCES `estado_carta` (`idEstadoCarta`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_carta_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `carta_categoria`
--
ALTER TABLE `carta_categoria`
  ADD CONSTRAINT `fk_carta` FOREIGN KEY (`idCarta`) REFERENCES `carta` (`idCarta`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `kf_categoria` FOREIGN KEY (`idCategoria`) REFERENCES `categoria` (`idCategoria`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `facturacion`
--
ALTER TABLE `facturacion`
  ADD CONSTRAINT `fk_estado_facturacion` FOREIGN KEY (`idEstadoFacturacion`) REFERENCES `estado_facturacion` (`idEstadoFacturacion`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_facturacion_subasta` FOREIGN KEY (`idSubasta`) REFERENCES `subasta` (`idSubasta`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_facturacion_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `imagen_carta`
--
ALTER TABLE `imagen_carta`
  ADD CONSTRAINT `fk_imagen_carta` FOREIGN KEY (`idCarta`) REFERENCES `carta` (`idCarta`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `puja`
--
ALTER TABLE `puja`
  ADD CONSTRAINT `fk_puja_subasta` FOREIGN KEY (`idSubasta`) REFERENCES `subasta` (`idSubasta`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_puja_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `subasta`
--
ALTER TABLE `subasta`
  ADD CONSTRAINT `fk_subasta_carta` FOREIGN KEY (`idCarta`) REFERENCES `carta` (`idCarta`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_subasta_estado` FOREIGN KEY (`idEstadoSubasta`) REFERENCES `estado_subasta` (`idEstadoSubasta`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_subasta_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_estado` FOREIGN KEY (`idEstadoUsuario`) REFERENCES `estado_usuario` (`idEstadoUsuario`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`idRol`) REFERENCES `rol` (`idRol`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
